import { ArrayMinSize, IsArray, ValidateNested } from "class-validator"
import { OrderItemDto } from "./order-item.dto"
import { Type } from "class-transformer"

export class CreateOrderDto {

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true }) // valida cada uno de los elementos
    @Type(() => OrderItemDto)
    items: OrderItemDto[]
}
