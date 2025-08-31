// orders/dto/order-response.dto.ts
import { OrderStatus } from '../entities/enumEntityOrder.dto';
import { UserResponseDto } from '../../users/dto/userResponse.dto';
import { RestaurantResponseDto } from '../../restaurants/dto/restauranteResponse.dto';
import { OrderItemResponseDto } from './orderItemResponse.dto';
import { PaymentResponseDto } from '../../payments/dto/paymentResponse.dto';

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