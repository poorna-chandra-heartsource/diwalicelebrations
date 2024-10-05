import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IAddress } from "../interfaces/adress.interface";

export class AddressDetailsDto implements IAddress {
    @ApiProperty({ description: 'user id of the address' })
    @IsMongoId()
    @IsOptional()
    user_id: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsNumber()
    @IsOptional()
    pincode: number;

    @IsString()
    @IsOptional()
    addressLine1: string;

    @IsString()
    @IsOptional()
    addressLine2: string;

    @IsString()
    @IsOptional()
    landmark: string;
}