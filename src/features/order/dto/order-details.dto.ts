import { IsEnum, IsMongoId,IsNotEmpty,IsNumber,IsOptional, IsString } from "class-validator";
import { OrderStatus } from "../interfaces/order.enum";
import { IOrder } from "../interfaces/order.interface";
import { Types } from "mongoose";

export class OrderDetailsDto implements IOrder{
    @IsNumber()
    @IsOptional()
    total_price?: number;

    @IsEnum(OrderStatus)
    @IsOptional()
    status: string;
}