import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SharedModule } from 'src/shared/shared.module';
import { UserModule } from '../user/user.module';
import appConfig from 'src/config/app.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'diwali',
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
    forwardRef(() => UserModule ),
    forwardRef(() => SharedModule )
  ],
  providers: [AuthService, JwtStrategy ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
