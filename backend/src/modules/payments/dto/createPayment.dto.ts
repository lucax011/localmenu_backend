// payments/dto/create-payment.dto.ts
export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;
}