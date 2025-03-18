import { OrderStatus } from "@prisma/client"
import { IsEnum, IsUUID } from "class-validator"
import { OrderStatusList } from "../enum/order.enum"


export class ChangeOrderStatus {
    
    @IsUUID(4)
    id: string

    @IsEnum(OrderStatusList, {
        message: `Order Status are ${OrderStatusList}`
    })
    status: OrderStatus
}