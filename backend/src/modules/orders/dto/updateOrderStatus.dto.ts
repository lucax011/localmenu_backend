import { IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

// orders/dto/update-order-status.dto.ts
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
