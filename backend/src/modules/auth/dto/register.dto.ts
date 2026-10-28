import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  MinLength,
} from 'class-validator';
import { UserType } from '@prisma/client';

// auth/dto/registerDto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Ninguém se cadastra como ADMIN pela API
  @IsOptional()
  @IsIn([UserType.CUSTOMER, UserType.OWNER])
  userType?: UserType;
}
