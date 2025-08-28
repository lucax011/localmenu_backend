// orders/dto/order-response.dto.ts
export class OrderResponseDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  pickupTime?: Date;
  customerNotes?: string;
  createdAt: Date;
  
  customer: UserResponseDto;
  restaurant: RestaurantResponseDto;
  items: OrderItemResponseDto[];
  payment?: PaymentResponseDto;
}