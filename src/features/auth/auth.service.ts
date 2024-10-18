import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/signup.dto';
import { PasswordResetDto, PasswordUpdateDto } from './dto/password-updated.dto';
import * as crypto from 'crypto';
import { NotificationService } from 'src/shared/api-services/notification.service';
import appConfig from 'src/config/app.config';
import { decrypt } from 'src/shared/util';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService // Use forwardRef here
  ) {}

  // Validate user credentials
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Handle user login
  async login(loginUserDto: LoginDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user._id };
    return {
      id: user._id,
      firstName: user.full_name,
      email: user.email,
      token: this.jwtService.sign(payload),
    };
  }

  // Register new user
  async register(body: SignUpDto) {
    return this.userService.signupUser(body);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const token = await this.generatePasswordResetToken(email);
    const resetLink = `${appConfig().frontendUrl}/reset-password?token=${token}`; // Replace with your frontend URL
    await this.notificationService.passwordResetMail(email, resetLink);
  }

  // reset user password
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex'); // Generating a random token

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Token expiration (1 hour) from Token generation

    await this.userService.updateUserResetToken(user.email, token, expirationDate);

    return token;
  }

  // async validateResetToken(token:string): Promise<boolean> {
  //   const user = await this.userService.findByResetToken(token);
  //   if (!user || new Date() > user.resetTokenExpires) {
  //     return false;
  //   }
  //   return true;
  // }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userService.findByResetToken(token);
    if (!user || new Date() > user.resetTokenExpires) {
      throw new Error('Invalid or expired token');
    }
  
    // const hashedPassword = await bcrypt.hash(newPassword, 10); // Use bcrypt to hash the password
    await this.userService.updateUser(user.id, { password: newPassword }); // Update the user's password
  
    // Clear reset token after the password is reset
    const descryptedEmail = decrypt(user.email)
    await this.userService.updateUserResetToken(descryptedEmail, null, null);
  }
}
