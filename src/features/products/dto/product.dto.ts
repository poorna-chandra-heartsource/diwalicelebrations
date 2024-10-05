import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { UnitTypeEnum } from "../interfaces/product.enum";

export class ProductDto {
    @ApiProperty({ description: 'Serial Number of the product' })
    @IsString()
    @IsNotEmpty({ message: 'Serial Number should not be empty' })
    serial_number: number;

    @ApiProperty({ description: 'Name of the product' })
    @IsString()
    @IsNotEmpty({ message: 'name should not be empty' })
    name: string;

    @ApiProperty({ description: 'Product description' })
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'Category of the product' })
    @IsNotEmpty({ message: 'Category should not be empty' })
    category: string;


    @IsNumber()
    @IsOptional()
    rate_in_rs: number;

    @IsNumber()
    @IsOptional()
    per:  number;

    @ApiProperty({ description: 'Unit type' })
    @IsEnum(UnitTypeEnum)
    unit_type: UnitTypeEnum;
    
    @IsNumber()
    @IsOptional()
    unit_price: number;

    @IsNumber()
    @IsOptional()
    profit_percentage: number;

    @IsNumber()
    @IsNotEmpty()
    display_price: number;

    @IsString()
    @IsOptional()
    unit_of_sale: string;

    @IsString()
    @IsNotEmpty()
    image: string;

    @ApiProperty({ description: 'Created date of the product' })
    @IsDateString()
    @IsOptional()
    created_dt: string = new Date().toISOString();

    @ApiProperty({ description: 'Modified date of the product' })
    @IsDateString()
    @IsOptional()
    modified_dt: string;

    @ApiProperty({ description: 'Deleted date of the product' })
    @IsDateString()
    @IsOptional()
    deleted_dt: string;
}