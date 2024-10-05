import { IsArray, IsDateString, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsNumberString, IsObject, IsOptional, IsPhoneNumber, IsString, Matches, Min, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateUserAddressDto } from "src/features/address/dto/create-address.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IUser } from "src/features/user/interfaces/user.interface";

export class SignUpDto implements IUser{
    @IsString()
    @IsNotEmpty()
    readonly full_name: string;

    @ApiProperty({ description: 'Email Id of an user', example: 'abc@xyz.com'})
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password is too weak. It must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.'
    })
    readonly password: string;

    @IsPhoneNumber('IN', { message: 'Invalid phone number' })
    @IsNotEmpty()
    readonly mobile: string;

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