import { IsString, IsUrl, IsUUID } from "class-validator";

export class PaidOrderDto {
    
    @IsString()
    @IsUUID()
    orderId: string;

    @IsString()
    stripePaymentId: string;

    @IsString()
    @IsUrl()
    receiptURL: string;

}