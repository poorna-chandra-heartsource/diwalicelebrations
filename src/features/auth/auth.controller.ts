import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignUpDto } from './dto/signup.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto, PasswordResetDto, PasswordUpdateDto } from './dto/password-updated.dto';
import { IUser } from '../user/interfaces/user.interface';

@Controller('/api/auth')
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

  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    await this.authService.sendPasswordResetEmail(payload.email);
    return { message: 'Password reset link has been sent to your email' };
  }

  @Post('reset-password')
  @ApiOperation({ description: 'Password Reset'})
  @ApiResponse({ status: 200, description: 'Password reset successfully'})
  @ApiResponse({ status: 400, description: 'Bad Request'})
  async resetPassword(
      @Body() payload: PasswordResetDto
  ): Promise<any> {
    await this.authService.resetPassword(payload.token, payload.password); // Implement this method in AuthService
    return { message: 'Password successfully reset' };
  }
}
