import { IsArray, IsDateString, IsEnum, IsMongoId,IsNotEmpty,IsNumber,IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderStatus } from "../interfaces/order.enum";
import { IOrder } from "../interfaces/order.interface";
import { Type } from "class-transformer";
import { CreateOrderItemDto } from "src/features/order-items/dto/create-order-item.dto";
import { Types } from "mongoose";

export class CreateOrderDto implements IOrder{
    @IsString()
    @IsMongoId()
    @IsOptional()
    user_id: string | Types.ObjectId;

    @IsNumber()
    @IsNotEmpty()
    total_price: number;

    @IsEnum(OrderStatus)
    @IsOptional()
    status: string = OrderStatus.PENDING;

    @IsArray({ message: 'Orders must be an array' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @IsOptional()
    readonly orderItems: CreateOrderItemDto[];

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