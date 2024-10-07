import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { jwtConstants } from './jwt.constants';
import { ProductModule } from '../products/product.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
    UserModule, // Import User module to access user service,
    ProductModule,
    SharedModule
  ],
  providers: [AuthService, JwtStrategy ],
  controllers: [AuthController],
})
export class AuthModule {}
