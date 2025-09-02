import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UserModule } from '../../users/module/user.module';
import { PasswordResetService } from '../services/passwordReset.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../strategies/jwtRefresh.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), UserModule],
  providers: [
    AuthService,
    PasswordResetService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
