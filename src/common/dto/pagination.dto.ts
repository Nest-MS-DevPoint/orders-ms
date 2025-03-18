import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsPositive } from "class-validator"


export class PaginationDto{
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    public page: number = 1;
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    public limit: number = 10;

}