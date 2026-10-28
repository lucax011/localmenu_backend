import {
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { IsImageUrl } from '../../common/validators/imageUrl';
import { Transform } from 'class-transformer';

// menu/dto/create-menu-item.dto.ts
export class CreateMenuItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsImageUrl()
  imageUrl?: string | null;

  @IsNumber()
  @Min(0)
  @Transform(({ value }: { value: string }) => parseFloat(value))
  price: number;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @IsOptional()
  @IsNumber()
  order?: number = 0;
}
