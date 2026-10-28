import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma/module/prisma.module';
import { UserModule } from './modules/users/module/user.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { OrdersModule } from './modules/orders/module/orders.module';
import { RestaurantsModule } from './modules/restaurants/module/restaurants.module';
import { MenusModule } from './modules/menus/module/menus.module';
import { PaymentsModule } from './modules/payments/module/payments.module';
import { UploadsModule } from './modules/uploads/module/uploads.module';
import { AiModule } from './modules/ai/module/ai.module';
import { PublicModule } from './modules/public/module/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // Limite de tentativas nas rotas de login e cadastro (ver AuthController)
    ThrottlerModule.forRoot({
      throttlers: [
        { ttl: 60_000, limit: Number(process.env.AUTH_RATE_LIMIT) || 10 },
      ],
      errorMessage: 'Muitas tentativas. Espere um minuto e tente de novo.',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    RestaurantsModule,
    MenusModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    AiModule,
    PublicModule,
  ],
})
export class AppModule {}
