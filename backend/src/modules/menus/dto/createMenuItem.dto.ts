import { IsString ,MinLength, IsOptional,IsNumber , Min, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

// menu/dto/create-menu-item.dto.ts
export class CreateMenuItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @IsOptional()
  @IsNumber()
  order?: number = 0;
}