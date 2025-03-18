import { Controller, Logger, NotImplementedException, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ChangeOrderStatus, CreateOrderDto } from './dto';
import { OrderPagination } from './dto/order-pagination.dto';


@Controller('orders')
export class OrdersController {
  private logger = new Logger('OrderController');
  
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    this.logger.log('Create Order: ', createOrderDto)
    return this.ordersService.create(createOrderDto);
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
}
