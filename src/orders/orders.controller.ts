import { Controller, Logger, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderStatus, CreateOrderDto, OrderPagination, PaidOrderDto } from './dto';


@Controller('orders')
export class OrdersController {
  private logger = new Logger('OrderController');
  
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    this.logger.log('Create Order: ', createOrderDto)

    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);

    return {
      order,
      paymentSession
    }
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() orderPaginationDTO: OrderPagination) {
    return this.ordersService.findAll(orderPaginationDTO);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    this.logger.log(id)
    return this.ordersService.findOne(id);
  }

  @MessagePattern('changeOrderStatus')
  changeOrderStatus(
    @Payload() changeOrderStatus: ChangeOrderStatus
  ){
    return this.ordersService.changeStatus(changeOrderStatus)
    
  }

  @EventPattern('payment.succeeded')
  async handlePaymentSucceeded(
    @Payload() paidOrderDto: PaidOrderDto
  ){
    this.logger.log('Payment Succeeded Event Received')
    this.logger.log(paidOrderDto)
    return this.ordersService.markOrderAsPaid(paidOrderDto);
  }
}
