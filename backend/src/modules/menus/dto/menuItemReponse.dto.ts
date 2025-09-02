// menus/dto/menu-item-response.dto.ts
export class MenuItemResponseDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  order?: number;
  imageUrl?: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}
