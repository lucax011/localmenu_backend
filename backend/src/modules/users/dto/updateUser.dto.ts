import { IsEmail, IsString, MinLength, IsOptional, IsEnum,IsBoolean } from 'class-validator';
// import { UserType } from '../enums/userType.enum'; // Corrigiremos abaixo

// users/dto/update-user.dto.ts
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
