import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignUpDto } from './dto/signup.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PasswordUpdateDto } from './dto/password-updated.dto';
import { IUser } from '../user/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  // Signup route
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: SignUpDto) {
    return this.authService.register(body);
  }

  // Login route
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('reset-password')
  @ApiOperation({ description: 'Password Update'})
  @ApiResponse({ status: 200, description: 'Password updated successfully'})
  @ApiResponse({ status: 400, description: 'Bad Request'})
  updatePassword(
      @Body() payload: PasswordUpdateDto
  ): Promise<IUser> {
      return this.authService.updatePassword(payload)
  }
}
