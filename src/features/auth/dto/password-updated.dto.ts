import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class PasswordUpdateDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password is too weak. It must contain at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.'
    })
    password: string;
}