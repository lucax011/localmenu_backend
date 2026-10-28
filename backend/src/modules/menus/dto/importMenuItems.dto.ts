import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Um item lido pelo OCR e revisado pelo dono antes de entrar no cardápio
export class ImportedItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  // categoria onde o item entra; criada se ainda não existir
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;
}

export class ImportMenuItemsDto {
  // upload de onde os itens vieram (liga os itens ao processamento do OCR)
  @IsOptional()
  @IsString()
  uploadId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportedItemDto)
  items: ImportedItemDto[];
}
