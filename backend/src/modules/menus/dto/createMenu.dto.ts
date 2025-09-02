import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // opcional: versão inicial (ex: 'v1')
  @IsOptional()
  @IsString()
  version?: string;
}
