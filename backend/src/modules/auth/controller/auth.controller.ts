import {
  UnauthorizedException,
  Post,
  Body,
  Controller,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/passwordReset.service';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../../users/services/user.services';
import { JwtRefreshGuard } from '../guards/jwtRefresh.guard';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshTokenHash, ...userResult } = user;
    return this.authService.login(userResult);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.userService.create(dto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshTokenHash, ...userResult } = user;
    return this.authService.login(userResult);
  }

  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request) {
    const user = req.user as User & { refreshToken: string };
    return this.authService.refreshToken(user.id, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.userService.findById(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.passwordResetService.requestReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: { token: string; newPassword: string }) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }
}
