import { IsOptional, IsString, MinLength } from 'class-validator';

// O que o próprio usuário pode mudar no perfil
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
