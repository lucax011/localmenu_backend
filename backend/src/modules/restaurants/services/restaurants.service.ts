import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateRestaurantDto } from '../dto/createRestaurant.dto';
import { UpdateRestaurantDto } from '../dto/updateRestaurante.dto';
import { CreateRestaurantHoursDto } from '../dto/CreateRestaurantHours.dto';
import { slugify } from '../../common/utils/slug';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        ...dto,
        slug: await this.uniqueSlug(dto.name),
        ownerId,
        isActive: true,
        isVerified: false,
      },
    });
  }

  // "Brasa Burger" -> "brasa-burger", ou "brasa-burger-2" se já existir
  private async uniqueSlug(name: string) {
    const base = slugify(name) || 'restaurante';
    for (let n = 1; ; n++) {
      const slug = n === 1 ? base : `${base}-${n}`;
      const taken = await this.prisma.restaurant.findUnique({
        where: { slug },
      });
      if (!taken) return slug;
    }
  }

  // Relatório do período: pedidos, faturamento e itens mais vendidos.
  // Pedidos cancelados ou ainda não pagos (PENDING) não entram no faturamento.
  async report(restaurantId: string, ownerId: string, days = 30) {
    await this.ensureOwnership(restaurantId, ownerId);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const orders = await this.prisma.order.findMany({
      where: { restaurantId, createdAt: { gte: since } },
      include: { items: true },
    });
    const counted = orders.filter(
      (o) =>
        o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.PENDING,
    );
    const revenue = counted.reduce((acc, o) => acc + Number(o.total), 0);
    const byStatus = Object.fromEntries(
      Object.values(OrderStatus).map((s) => [
        s,
        orders.filter((o) => o.status === s).length,
      ]),
    );
    const items = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    for (const order of counted) {
      for (const line of order.items) {
        const entry = items.get(line.menuItemId) ?? {
          name: line.nameSnapshot,
          quantity: 0,
          revenue: 0,
        };
        entry.quantity += line.quantity;
        entry.revenue += Number(line.totalPrice);
        items.set(line.menuItemId, entry);
      }
    }
    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      days,
      since,
      orders: orders.length,
      paidOrders: counted.length,
      revenue: round(revenue),
      averageTicket: counted.length ? round(revenue / counted.length) : 0,
      byStatus,
      topItems: [...items.values()]
        .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
        .slice(0, 5)
        .map((i) => ({ ...i, revenue: round(i.revenue) })),
    };
  }

  async findPublic(id: string) {
    const r = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        hours: { orderBy: { dayOfWeek: 'asc' } },
        menus: {
          where: { isActive: true },
          include: {
            categories: {
              include: { items: { where: { isAvailable: true } } },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    if (!r) throw new NotFoundException('Restaurante não encontrado');
    return r;
  }

  async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
    const r = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Restaurante não encontrado');
    if (r.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  async myRestaurants(ownerId: string) {
    return this.prisma.restaurant.findMany({
      where: { ownerId },
      include: { hours: true },
    });
  }

  async findAll() {
    return this.prisma.restaurant.findMany({
      where: { isActive: true, isVerified: true },
      take: 50,
    });
  }

  async searchNearby(lat: number, lng: number, radiusKm = 10) {
    // Para produção, use PostGIS com $queryRaw.
    // Esta é uma aproximação simples.
    const latDelta = radiusKm / 111.32;
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));

    return this.prisma.restaurant.findMany({
      where: {
        isActive: true,
        isVerified: true,
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      take: 50,
    });
  }

  async addOrUpdateHours(
    restaurantId: string,
    ownerId: string,
    dto: CreateRestaurantHoursDto,
  ) {
    await this.ensureOwnership(restaurantId, ownerId);
    return this.prisma.restaurantHours.upsert({
      where: {
        restaurantId_dayOfWeek: {
          restaurantId,
          dayOfWeek: dto.dayOfWeek,
        },
      },
      update: { ...dto },
      create: { restaurantId, ...dto },
    });
  }

  async deleteHour(restaurantId: string, hourId: string, ownerId: string) {
    await this.ensureOwnership(restaurantId, ownerId);
    const hour = await this.prisma.restaurantHours.findUnique({
      where: { id: hourId },
    });
    if (!hour || hour.restaurantId !== restaurantId) {
      throw new NotFoundException('Horário não encontrado neste restaurante.');
    }
    await this.prisma.restaurantHours.delete({ where: { id: hourId } });
    return { success: true, message: 'Horário removido.' };
  }

  async upsertRestaurantHours(
    restaurantId: string,
    hoursData: CreateRestaurantHoursDto[],
  ) {
    const transactions = hoursData.map((hour) => {
      const { dayOfWeek, openTime, closeTime } = hour;
      return this.prisma.restaurantHours.upsert({
        where: {
          restaurantId_dayOfWeek: {
            restaurantId,
            dayOfWeek,
          },
        },
        update: {
          openTime,
          closeTime,
        },
        create: {
          restaurantId,
          dayOfWeek,
          openTime,
          closeTime,
        },
      });
    });

    return this.prisma.$transaction(transactions);
  }

  private async ensureOwnership(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante não encontrado.');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();
  }
}
