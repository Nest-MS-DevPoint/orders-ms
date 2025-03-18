import { PaginationDto } from "src/common";
import { OrderStatusList } from "../enum/order.enum";
import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "@prisma/client";


export class OrderPagination extends PaginationDto {

    @IsOptional()
    @IsEnum(OrderStatusList, {
        message: `Valid status are ${OrderStatusList}`
    })
    status: OrderStatus
}