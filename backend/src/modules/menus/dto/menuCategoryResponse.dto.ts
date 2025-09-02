import { MenuItemResponseDto } from './menuItemReponse.dto';

export class MenuCategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  menuId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: MenuItemResponseDto[];
}
