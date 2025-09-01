import { UnauthorizedException, Post, Body, Controller } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/passwordReset.service';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../../users/services/user.services';

// src/modules/auth/controller/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.userService.create(dto);
    return this.authService.login(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.passwordResetService.requestReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: { token: string; newPassword: string }) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }
}
