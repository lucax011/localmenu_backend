import { IsString, IsArray, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './createOrderItem.dto';

export class CreateOrderDto {
  @IsString()
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsDateString()
  pickupTime?: string;
}