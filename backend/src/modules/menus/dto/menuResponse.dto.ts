// menus/dto/menu-response.dto.ts
import { MenuItemResponseDto } from './menuItemReponse.dto';

export class MenuResponseDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Itens (opcional para evitar payload pesado em listagens)
  items?: MenuItemResponseDto[];
}
