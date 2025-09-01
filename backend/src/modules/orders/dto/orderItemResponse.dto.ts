export class OrderItemResponseDto {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  lineTotal: number;
}
