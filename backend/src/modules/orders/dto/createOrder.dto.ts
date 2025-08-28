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