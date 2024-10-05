import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { UnitTypeEnum } from "../interfaces/product.enum";

export class ProductDetailsDto {
    @ApiProperty({ description: 'Serial Number of the product' })
    @IsString()
    @IsOptional()
    serial_number?: number;

    @ApiProperty({ description: 'Name of the product' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ description: 'Product description' })
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'Category of the product' })
    @IsOptional()
    category?: string;


    @IsNumber()
    @IsOptional()
    rate_in_rs?: number;

    @IsNumber()
    @IsOptional()
    per?:  number;

    @ApiProperty({ description: 'Unit type' })
    @IsEnum(UnitTypeEnum)
    @IsOptional()
    unit_type?: UnitTypeEnum;
    
    @IsNumber()
    @IsOptional()
    unit_price?: number;

    @IsNumber()
    @IsOptional()
    profit_percentage?: number;

    @IsNumber()
    @IsOptional()
    display_price?: number;

    @IsString()
    @IsOptional()
    unit_of_sale?: string;

    @IsString()
    @IsOptional()
    image?: string;
}