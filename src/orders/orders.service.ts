import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPagination } from './dto/order-pagination.dto';
import { ChangeOrderStatus, CreateOrderDto } from './dto';
import { NATS_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService')
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected!')
  }

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ){
    super();
  }
  
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(createOrderDto)

    const { items } = createOrderDto;
    const productsIds = items.map( product => product.productId)

    this.logger.log(productsIds)
    
    try {
      // 1. Confirmar Ids de productos
      const products: any[] = await firstValueFrom(this.client.send({cmd: 'validate_product'}, productsIds))
      this.logger.log(products)

      // 2. Calculos de los valores
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(product => product.id === orderItem.productId).price
        this.logger.log('price: ', price)

        return price * orderItem.quantity
      }, 0)

      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity
      }, 0)

      // 3. Crear transaccion de base de datos
      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          orderItem: {
            createMany: {
              data: createOrderDto.items.map(orderItem => ({
                price: products.find(product => product.id === orderItem.productId).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity
              }))
            }
          }
        },
        include: {
          orderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      })

      return {
        ...order,
        orderItem: order.orderItem.map(orderitem => ({
          ...orderitem,
          name: products.find(product => product.id === orderitem.productId).name
        }))
      }

    } catch (error) {
      this.logger.log(error)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: "Check logs"
      })
    }
  }

  async findAll(orderPaginationDto: OrderPagination) {
    this.logger.log(orderPaginationDto)
    const { page, limit, status } = orderPaginationDto;
    const total = await this.order.count({
      where: {
        status: status
      }
    })
    const lastPage = Math.ceil(total / limit)

    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          status: status
        }
      }),
      meta:{
        total,
        page,
        lastPage
      }
    }
  }

  async findOne(id: string) {
    
    const order =  await this.order.findFirst({
      where: {
        id
      },
      include: {
        orderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    })

    if (!order){
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order '${id}' not found`
      })
    }

    const productsIds = order.orderItem.map(( product => product.productId))
    const products: any[] = await firstValueFrom(this.client.send({cmd: 'validate_product'}, productsIds))


    return {
      ...order,
      orderItem: order.orderItem.map(orderitem => ({
        ...orderitem,
        name: products.find(product => product.id === orderitem.productId).name
      }))
    }
  }


  async changeStatus(changeOrderStatus: ChangeOrderStatus){
    const {id, status} = changeOrderStatus
    
    const order = await this.findOne(id)

    if (order.status === status){
      return order
    }

    return this.order.update({
      where: {id},
      data: {status: status},
    })
  }
}
