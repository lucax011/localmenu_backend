// users/dto/create-user.dto.ts
export class CreateUserDto {
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

  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType = UserType.CUSTOMER;
}

