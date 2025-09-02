import { Module } from '@nestjs/common';
import { RestaurantsService } from '../services/restaurants.service';
import { RestaurantsController } from '../controller/restaurants.controller';
import { PrismaModule } from '../../prisma/module/prisma.module';
import { AuthModule } from '../../auth/module/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
