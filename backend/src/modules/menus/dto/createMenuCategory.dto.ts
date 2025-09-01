import { IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

// menu/dto/create-menu-category.dto.ts
export class CreateMenuCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsNumber()
  order?: number = 0;
}
