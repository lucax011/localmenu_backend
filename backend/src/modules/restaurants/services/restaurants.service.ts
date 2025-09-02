import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateRestaurantDto } from '../dto/createRestaurant.dto';
import { UpdateRestaurantDto } from '../dto/updateRestaurante.dto';
import { CreateRestaurantHoursDto } from '../dto/CreateRestaurantHours.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: { ...dto, ownerId, isActive: true, isVerified: false },
    });
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
