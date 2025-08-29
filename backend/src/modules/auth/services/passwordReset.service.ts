import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { UserService } from '../../users/services/user.services';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PasswordResetService {
  constructor(private prisma: PrismaService, private userService: UserService) {}

  async requestReset(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const token = uuidv4();
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token },
    });
    // Mock: Retorne o token ou log no console
    return { message: 'Solicitação registrada', token };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!reset || reset.used) throw new BadRequestException('Token inválido ou já usado');
    await this.userService.update(reset.userId, { password: newPassword });
    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
    return { message: 'Senha redefinida com sucesso' };
  }
}