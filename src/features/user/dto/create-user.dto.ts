import { IsArray, IsDateString, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsNumberString, IsObject, IsOptional, IsPhoneNumber, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {  } from "../../products/dto/product.dto";
import { IUser } from "../interfaces/user.interface";
import { CreateUserAddressDto } from "src/features/address/dto/create-address.dto";
import { Type } from "class-transformer";
import { CreateOrderDto } from "src/features/order/dto/create-order.dto";

export class CreateUserDto implements IUser {
    @IsString()
    @IsNotEmpty()
    readonly full_name: string;

    @ApiProperty({ description: 'Email Id of an user', example: 'abc@xyz.com'})
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly password: string;

    @IsPhoneNumber('IN', { message: 'Invalid phone number' })
    readonly mobile: string;

    @ValidateNested()
    @Type(() => CreateUserAddressDto)
    @IsOptional()
    readonly address: CreateUserAddressDto;
    
    @ValidateNested()
    @Type(() => CreateOrderDto)
    @IsOptional()
    readonly order: CreateOrderDto;

    @IsDateString()
    @IsOptional()
    readonly created_dt: string = new Date().toISOString();

    @IsDateString()
    @IsOptional()
    readonly modified_dt: string;

    @IsDateString()
    @IsOptional()
    readonly deleted_dt: string;
}