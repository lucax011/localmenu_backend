import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { UpdateOrderStatusDto } from '../dto/updateOrderStatus.dto';
import { OrderStatus } from '@prisma/client';

// Caminho de um pedido de retirada. Cancelar só antes do preparo.
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY],
  READY: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

const ORDER_DETAILS = {
  items: true,
  payment: true,
  restaurant: { select: { id: true, name: true, slug: true, address: true } },
} as const;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('O pedido precisa de pelo menos um item.');
    }
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });
    if (!restaurant || !restaurant.isActive) {
      throw new BadRequestException('Restaurante indisponível.');
    }

    const ids = [...new Set(dto.items.map((i) => i.menuItemId))];
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: ids } },
      include: { category: { include: { menu: true } } },
    });
    if (menuItems.length !== ids.length) {
      throw new BadRequestException(
        'Um ou mais itens do cardápio não foram encontrados.',
      );
    }
    if (
      menuItems.some((m) => m.category.menu.restaurantId !== dto.restaurantId)
    ) {
      throw new BadRequestException(
        'Todos os itens do pedido devem pertencer ao mesmo restaurante.',
      );
    }
    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length) {
      throw new BadRequestException(
        `Indisponível no momento: ${unavailable.map((m) => m.name).join(', ')}.`,
      );
    }

    // o preço vem sempre do cardápio, nunca do app
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    const lines = dto.items.map((i) => {
      const mi = byId.get(i.menuItemId);
      return {
        menuItemId: mi.id,
        nameSnapshot: mi.name,
        unitPrice: mi.price,
        quantity: i.quantity,
        notes: i.notes,
        totalPrice: Number(mi.price) * i.quantity,
      };
    });
    const subtotal = lines.reduce((acc, l) => acc + l.totalPrice, 0);
    const deliveryFee = 0; // só retirada no MVP

    return this.prisma.order.create({
      data: {
        customerId,
        restaurantId: dto.restaurantId,
        status: OrderStatus.PENDING,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        customerNotes: dto.customerNotes,
        pickupTime: dto.pickupTime ? new Date(dto.pickupTime) : undefined,
        orderNumber: randomBytes(3).toString('hex').toUpperCase(),
        items: { create: lines },
      },
      include: ORDER_DETAILS,
    });
  }

  async listByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: ORDER_DETAILS,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForCustomer(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_DETAILS,
    });
    if (!order || order.customerId !== customerId) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    return order;
  }

  async listByRestaurant(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante não encontrado.');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: true,
        payment: { select: { status: true, method: true, paidAt: true } },
        // do cliente, o restaurante vê só o necessário para a retirada
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    orderId: string,
    ownerId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado.');
    if (order.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado a este pedido.');
    }
    if (!NEXT_STATUS[order.status].includes(dto.status)) {
      throw new BadRequestException(
        `Não é possível passar de ${order.status} para ${dto.status}.`,
      );
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: { items: true },
    });
  }
}
