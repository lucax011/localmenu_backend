import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserType } from '@prisma/client';

// users/dto/user-response.dto.ts
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  isActive: boolean;
  createdAt: Date;
}
