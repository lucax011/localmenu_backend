// auth/dto/registerDto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @String()
  @length(6)
  password: string;

  @String()
  @length(2)
  name: string;

  @IsOptional()
  @String()
  phone?: string;

  @IsEnum(UserType)
  userType: UserType;
}




