import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsNumberString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IAddress } from "../interfaces/adress.interface";

export class AddressDto implements IAddress{
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    user_id: string;

    @IsString()
    @IsNotEmpty({ message: 'city is required' })
    city: string;

    @IsString()
    @IsNotEmpty({ message: 'state is required' })
    state: string;

    @IsNumberString()
    @IsNotEmpty({ message: 'pincode is required' })
    pincode: number;

    @IsString({ message: 'addressLine1 must be a string' })
    @IsNotEmpty({ message: 'addressLine1 is required' })
    addressLine1: string;

    @IsString({ message: 'addressLine2 must be a string' })
    @IsOptional({ message: 'addressLine2 is required' })
    addressLine2: string;

    @IsString()
    @IsOptional()
    landmark: string;

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

export class CreateAddressDto extends AddressDto {
    @IsNotEmpty()
    user_id: string;
}

export class CreateUserAddressDto extends AddressDto {
    @IsMongoId({ message: 'user_id must be a valid MongoDB ID' })
    @IsOptional()
    user_id: string;
}