import { IsDateString, IsEnum, IsMongoId,IsNotEmpty,IsNumber,IsOptional, IsString } from "class-validator";
import { IOrderItem } from "../interfaces/order-item.interface";

export class CreateOrderItemDto implements IOrderItem{
    @IsString()
    @IsMongoId()
    @IsOptional()
    order_id: string;

    @IsString()
    @IsMongoId()
    @IsOptional()
    product_id: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsDateString()
    @IsOptional()
    created_dt: string = new Date().toISOString();

    @IsDateString()
    @IsOptional()
    modified_dt: string;

    @IsDateString()
    @IsOptional()
    deleted_dt: string;
}