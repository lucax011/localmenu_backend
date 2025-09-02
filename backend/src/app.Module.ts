import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/module/prisma.module';
import { UserModule } from './modules/users/module/user.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { OrdersModule } from './modules/orders/module/orders.module';
import { RestaurantsModule } from './modules/restaurants/module/restaurants.module';
import { MenusModule } from './modules/menus/module/menus.module';
import { PaymentsModule } from './modules/payments/module/payments.module';
import { UploadsModule } from './modules/uploads/module/uploads.module';
import { AiModule } from './modules/ai/module/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    UserModule,
    AuthModule,
    RestaurantsModule,
    MenusModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    AiModule,
  ],
})
export class AppModule {}
