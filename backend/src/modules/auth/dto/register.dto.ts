import { IsEmail, IsString, IsOptional, IsEnum,Length } from 'class-validator';
import { UserType } from '../../users/enum/userType.enum';

// auth/dto/registerDto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;

  @IsString()
  @Length(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserType)
  userType: UserType;
}




