import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UserModule } from '../../users/module/user.module';
import { PasswordResetService } from '../services/passwordReset.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultsecret',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  providers: [AuthService, PasswordResetService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
