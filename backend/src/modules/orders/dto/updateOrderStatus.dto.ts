import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/enumEntityOrder.dto';

// orders/dto/update-order-status.dto.ts
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}