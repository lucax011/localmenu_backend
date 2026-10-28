// orders/dto/create-order-item.dto.ts
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  menuItemId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
