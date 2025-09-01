// orders/dto/create-order-item.dto.ts
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

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
