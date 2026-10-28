import {
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { IsImageUrl } from '../../common/validators/imageUrl';

// restaurants/dto/update-restaurant.dto.ts
export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsImageUrl()
  logoUrl?: string | null;

  @IsImageUrl()
  coverUrl?: string | null;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
