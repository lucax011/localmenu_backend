import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';

// Leitura pública (sem login) para o app do cliente: só restaurantes ativos
// e só os campos que o cliente precisa ver.
@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async listRestaurants() {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        phone: true,
        menus: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { id: true },
        },
      },
    });
    return restaurants.map(({ menus, ...r }) => ({
      ...r,
      menuId: menus[0]?.id ?? null,
    }));
  }

  async restaurantBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        phone: true,
        hours: {
          orderBy: { dayOfWeek: 'asc' },
          select: {
            dayOfWeek: true,
            openTime: true,
            closeTime: true,
            isOpen: true,
          },
        },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurante não encontrado.');

    const menu = await this.prisma.menu.findFirst({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        categories: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            order: true,
            items: {
              orderBy: [{ order: 'asc' }, { name: 'asc' }],
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });
    return { restaurant, menu };
  }
}
