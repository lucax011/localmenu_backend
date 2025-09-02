import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    // DEBUG TEMP (remover depois)
    if (!secret) {
      console.warn(
        '[JwtStrategy] Variáveis disponíveis (subset):',
        Object.keys(process.env).filter(
          (k) => k.startsWith('JWT') || k.includes('SECRET'),
        ),
      );
      console.warn(
        '[JwtStrategy] Valor bruto process.env.JWT_SECRET =',
        process.env.JWT_SECRET,
      );
    }
    if (!secret) {
      throw new Error('JWT_SECRET não definido nas variáveis de ambiente.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
