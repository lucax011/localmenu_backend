import { IsString, IsNumber, Min,IsOptional , MinLength, IsEmail, Max } from 'class-validator';

// restaurants/dto/create-restaurant.dto.ts
export class CreateRestaurantDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
