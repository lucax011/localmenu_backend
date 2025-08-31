import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/module/prisma.module';
import { UserModule } from './modules/users/module/user.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { OrdersModule } from './modules/orders/module/orders.module';
// Importar futuramente: RestaurantsModule, MenusModule, PaymentsModule

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    OrdersModule,
  ],
})
export class AppModule {}