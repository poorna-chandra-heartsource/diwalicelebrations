import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './jwt.constants';
import { SharedModule } from 'src/shared/shared.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
    forwardRef(() => UserModule ),
    forwardRef(() => SharedModule )
  ],
  providers: [AuthService ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
