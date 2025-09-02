import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { UpdateOrderStatusDto } from '../dto/updateOrderStatus.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: { category: { include: { menu: true } } },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException(
        'Um ou mais itens do cardápio não foram encontrados.',
      );
    }

    // Validar se todos os itens pertencem ao mesmo restaurante
    const restaurantIds = new Set(
      menuItems.map((item) => item.category.menu.restaurantId),
    );
    if (restaurantIds.size !== 1 || !restaurantIds.has(dto.restaurantId)) {
      throw new BadRequestException(
        'Todos os itens do pedido devem pertencer ao mesmo restaurante.',
      );
    }

    const subtotal = dto.items.reduce((acc, item) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return acc + Number(mi.price) * item.quantity;
    }, 0);

    const deliveryFee = 0; // Pickup no MVP
    const total = subtotal + deliveryFee;

    return this.prisma.order.create({
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
        items: {
          create: dto.items.map((i) => {
            const mi = menuItems.find((m) => m.id === i.menuItemId);
            return {
              menuItemId: mi.id,
              nameSnapshot: mi.name,
              unitPrice: mi.price,
              quantity: i.quantity,
              notes: i.notes,
              totalPrice: Number(mi.price) * i.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });
  }

  async listByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { items: true, payment: true, restaurant: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByRestaurant(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante não encontrado.');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.order.findMany({
      where: { restaurantId },
      include: { items: true, customer: true },
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

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${orderId} não encontrado.`);
    }

    if (order.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado a este pedido.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: status },
    });
  }

  async findOrdersByRestaurant(restaurantId: string) {
    return this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        // CORREÇÃO: A relação no schema.prisma se chama 'customer', não 'user'.
        customer: true,
        items: true,
      },
    });
  }

  async findOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      // CORREÇÃO: O campo no schema.prisma é 'customerId', não 'userId'.
      // A relação no modelo User é 'orders', mas o campo no modelo Order é 'customerId'.
      where: { customerId: userId },
      include: {
        restaurant: true,
        items: true,
      },
    });
  }
}
