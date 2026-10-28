import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreatePaymentDto } from '../dto/createPayment.dto';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Pagamento SIMULADO (fase DEV): aprovado na hora, sem gateway e sem dados de cartão.
// Para um gateway real, a aprovação viria por webhook assinado do provedor.
@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });
    if (!order || order.customerId !== customerId) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    if (order.payment) throw new ConflictException('Este pedido já foi pago.');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Este pedido não pode mais ser pago.');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: dto.method,
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          gatewayTransactionId: `simulado_${uuidv4()}`,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      });
      return payment;
    });
  }

  async findByOrderId(orderId: string, customerId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });
    if (!payment || payment.order.customerId !== customerId) {
      throw new NotFoundException('Pagamento não encontrado.');
    }
    return payment;
  }
}
