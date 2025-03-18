import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPagination } from './dto/order-pagination.dto';
import { ChangeOrderStatus, CreateOrderDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService')
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected!')
  }
  
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(createOrderDto)
    try {
      return await this.order.create({
        data: createOrderDto
      })
    } catch (error) {
      this.logger.log(error)
      throw new RpcException(error)
    }
  }

  async findAll(orderPaginationDto: OrderPagination) {
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
      }
    })

    if (!order){
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order '${id}' not found`
      })
    }

    return order
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
