// payments/dto/payment-response.dto.ts
export class PaymentResponseDto {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayTransactionId?: string;
  createdAt: Date;
  paidAt?: Date;
}