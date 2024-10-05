import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/signup.dto';
import { PasswordUpdateDto } from './dto/password-updated.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    const payload = { email: user.email, sub: user._id, role: user.role };
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

    // Update user password
    async updatePassword(payload: PasswordUpdateDto) {
      return this.userService.updateUserPassword(payload);
    }
}
