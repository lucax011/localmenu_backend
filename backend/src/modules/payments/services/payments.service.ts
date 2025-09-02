import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreatePaymentDto } from '../dto/createPayment.dto';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    if (order.customerId !== customerId) throw new ForbiddenException();
    if (order.total.toNumber() !== dto.amount) {
      throw new BadRequestException(
        'The provided amount does not match the order total.',
      );
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Este pedido não pode mais ser pago.');
    }

    // Simula a criação de uma transação em um gateway de pagamento
    const gatewayTransactionId = `mock_txn_${uuidv4()}`;

    return this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.PENDING,
        gatewayTransactionId,
      },
    });
  }

  async findByOrderId(orderId: string, customerId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');
    if (payment.order.customerId !== customerId) throw new ForbiddenException();
    return payment;
  }

  async handleSuccessfulPayment(transactionId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayTransactionId: transactionId },
    });

    if (!payment) {
      throw new NotFoundException(
        `Pagamento com ID de transação ${transactionId} não encontrado.`,
      );
    }

    if (payment.status === PaymentStatus.PAID) {
      return { message: 'Pagamento já foi processado.' };
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });

      return updatedPayment;
    });
  }
}
