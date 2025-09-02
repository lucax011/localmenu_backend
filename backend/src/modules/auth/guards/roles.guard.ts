import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express'; // Importe o tipo Request

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    // CORREÇÃO: Adicione o tipo <Request> para que o TypeScript reconheça a estrutura da requisição.
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // O tipo 'User' do express precisa ser estendido globalmente para incluir 'userType'.
    // Se você já fez isso no arquivo 'express.d.ts', esta verificação funcionará.
    return requiredRoles.some((role) => user?.['userType'] === role);
  }
}
