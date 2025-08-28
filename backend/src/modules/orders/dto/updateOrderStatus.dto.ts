// orders/dto/update-order-status.dto.ts
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}