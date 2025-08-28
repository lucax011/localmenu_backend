// orders/dto/create-order-item.dto.ts
export class CreateOrderItemDto {
  @IsString()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}