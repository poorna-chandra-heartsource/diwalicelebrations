import { IsDateString, IsEnum, IsMongoId,IsNotEmpty,IsNumber,IsOptional, IsString } from "class-validator";
import { IOrderItem } from "../interfaces/order-item.interface";

export class OrderItemDetailsDto implements IOrderItem{
    @IsString()
    @IsMongoId()
    order_id?: string;

    @IsString()
    @IsMongoId()
    product_id: string;

    @IsNumber()
    @IsNotEmpty()
    quantity?: number;

    @IsNumber()
    @IsNotEmpty()
    price?: number;
}