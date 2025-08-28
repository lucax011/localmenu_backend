// restaurants/dto/restaurant-response.dto.ts
export class RestaurantResponseDto {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  cnpj?: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  
  @IsOptional()
  hours?: RestaurantHoursResponseDto[];
  
  @IsOptional()
  menus?: MenuResponseDto[];
}