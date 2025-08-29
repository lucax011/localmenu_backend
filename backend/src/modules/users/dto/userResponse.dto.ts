import { IsEmail, IsString, MinLength, IsOptional, IsEnum,IsBoolean } from 'class-validator';
import { UserType } from '../enum/userType.enum'; // Corrigiremos abaixo

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
