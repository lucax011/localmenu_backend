import { Module } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { OrdersController } from '../controller/orders.controller';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}