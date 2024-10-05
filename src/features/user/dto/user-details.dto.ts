import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsDateString, IsNotEmpty } from "class-validator";
import { IUser } from "../interfaces/user.interface";

export class UserDetailsDto implements IUser {
    @IsString()
    @IsOptional()
    full_name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsPhoneNumber('IN', { message: 'Invalid phone number' })
    @IsOptional()
    mobile?: string;

    @IsDateString()
    @IsOptional()
    created_dt?: string;

    @IsDateString()
    @IsOptional()
    modified_dt?: string;

    @IsDateString()
    @IsOptional()
    deleted_dt?: string;
}