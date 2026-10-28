import { IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

// O valor não vem do app: é sempre o total do pedido no banco.
export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
