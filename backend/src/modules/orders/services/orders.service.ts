import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { UpdateOrderStatusDto } from '../dto/updateOrderStatus.dto';
import { OrderStatus } from '../entities/enumEntityOrder.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const menuItemIds = dto.items.map(i => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });
    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('Alguns itens não existem');
    }

    const subtotal = dto.items.reduce((acc, item) => {
      const mi = menuItems.find(m => m.id === item.menuItemId)!;
      return acc + Number(mi.price) * item.quantity;
    }, 0);

    const deliveryFee = 0; // pickup no MVP
    const total = subtotal + deliveryFee;

    return this.prisma.$transaction(async tx => {
      const order = await tx.order.create({
        data: {
          customerId,
            restaurantId: dto.restaurantId,
          status: OrderStatus.PENDING,
          subtotal,
          deliveryFee,
          total,
          customerNotes: dto.customerNotes,
          pickupTime: dto.pickupTime ? new Date(dto.pickupTime) : undefined,
          orderNumber: `#${Date.now().toString().slice(-6)}`,
        },
      });

      await tx.orderItem.createMany({
        data: dto.items.map(i => {
          const mi = menuItems.find(m => m.id === i.menuItemId)!;
          return {
            orderId: order.id,
            menuItemId: mi.id,
            nameSnapshot: mi.name,
            unitPrice: mi.price,
            quantity: i.quantity,
            notes: i.notes,
            totalPrice: Number(mi.price) * i.quantity,
          };
        }),
      });

      return order;
    });
  }

  async listByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { items: true, payment: true, restaurant: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    // Regra simples de transição
    const allowed = {
      PENDING: ['READY', 'CANCELED'],
      READY: ['COMPLETED'],
      COMPLETED: [],
      CANCELED: [],
    } as Record<string, string[]>;
    if (!allowed[order.status].includes(dto.status)) {
      throw new BadRequestException('Transição inválida');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }
}