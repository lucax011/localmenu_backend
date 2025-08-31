export enum OrderStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED', // opcional para extensões futuras
}

export class OrderEntity {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  pickupTime?: Date;
  customerNotes?: string;
  createdAt: Date;
  customerId: string;
  restaurantId: string;

  static nextStatus(current: OrderStatus): OrderStatus[] {
    switch (current) {
      case OrderStatus.PENDING: return [OrderStatus.READY, OrderStatus.CANCELED];
      case OrderStatus.READY: return [OrderStatus.COMPLETED];
      default: return [];
    }
  }
}