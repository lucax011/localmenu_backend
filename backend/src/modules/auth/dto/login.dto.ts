import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

// auth/dto/login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}