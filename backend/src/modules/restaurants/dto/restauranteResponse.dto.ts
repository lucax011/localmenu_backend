// restaurants/dto/restaurant-response.dto.ts
// DTO de saída: não usar decorators de validação aqui (somente tipagem)
import { RestaurantHoursResponseDto } from './restaurantHoursResponse.dto';
import { MenuResponseDto } from '../../menus/dto/menuResponse.dto';

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

  // Relacionamentos opcionais agregados
  hours?: RestaurantHoursResponseDto[];
  menus?: MenuResponseDto[];
}
