// users/dto/user-response.dto.ts
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  isActive: boolean;
  createdAt: Date;
  
  @IsOptional()
  customerProfile?: CustomerProfileResponseDto;
  
  @IsOptional()
  restaurantProfile?: RestaurantProfileResponseDto;
}
