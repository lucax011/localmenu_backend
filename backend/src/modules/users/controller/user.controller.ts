import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserService } from '../services/user.services';
import { UpdateMeDto } from '../dto/updateMe.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';

// Cada usuário só vê e altera o próprio perfil. Não há listagem de usuários.
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  me(@CurrentUser() user: User) {
    return this.userService.findSafeById(user.id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateMeDto) {
    await this.userService.update(user.id, dto);
    return this.userService.findSafeById(user.id);
  }
}
