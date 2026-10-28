import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { IsImageUrl } from '../../common/validators/imageUrl';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsImageUrl()
  imageUrl?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  // mover para outra categoria do mesmo cardápio
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
