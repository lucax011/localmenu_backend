import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateMenuDto } from '../dto/createMenu.dto';
import { CreateMenuCategoryDto } from '../dto/createMenuCategory.dto';
import { CreateMenuItemDto } from '../dto/createMenuItem.dto';
import { UpdateMenuItemDto } from '../dto/updateMenuItem.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async createMenu(restaurantId: string, dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        restaurantId,
        name: dto.name,
        // description removido (não existe no schema)
        // version removido se não existir
        isActive: true,
      },
    });
  }

  async listMenus(restaurantId: string) {
    return this.prisma.menu.findMany({
      where: { restaurantId },
      include: {
        categories: {
          include: { items: true },
          orderBy: { order: 'asc' }, // usar 'order' ao invés de sortOrder
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addCategory(
    menuId: string,
    dto: CreateMenuCategoryDto,
    ownerRestaurantId?: string,
  ) {
    await this.ensureMenuOwnership(menuId, ownerRestaurantId);
    const maxOrder = await this.prisma.menuCategory.aggregate({
      where: { menuId },
      _max: { order: true },
    });
    const next = (maxOrder._max?.order ?? 0) + 1;

    return this.prisma.menuCategory.create({
      data: {
        menuId,
        name: dto.name,
        // description removido (não existe)
        order: dto.sortOrder ?? next,
      },
    });
  }

  async addItem(dto: CreateMenuItemDto, ownerRestaurantId?: string) {
    if (!dto.categoryId) {
      throw new NotFoundException('categoryId obrigatório');
    }
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: dto.categoryId },
      include: { menu: true },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (ownerRestaurantId && category.menu.restaurantId !== ownerRestaurantId) {
      throw new ForbiddenException();
    }
    return this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async updateItem(
    id: string,
    dto: UpdateMenuItemDto,
    ownerRestaurantId?: string,
  ) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: { include: { menu: true } } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    if (!item.category) throw new NotFoundException('Categoria não associada');
    if (
      ownerRestaurantId &&
      item.category.menu.restaurantId !== ownerRestaurantId
    ) {
      throw new ForbiddenException();
    }
    return this.prisma.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteItem(id: string, ownerRestaurantId?: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: { include: { menu: true } } },
    });
    if (!item) throw new NotFoundException('Item não encontrado');
    if (!item.category) throw new NotFoundException('Categoria não associada');
    if (
      ownerRestaurantId &&
      item.category.menu.restaurantId !== ownerRestaurantId
    ) {
      throw new ForbiddenException();
    }
    await this.prisma.menuItem.delete({ where: { id } });
    return { success: true };
  }

  async ensureMenuOwnership(menuId: string, ownerRestaurantId?: string) {
    if (!ownerRestaurantId) return;
    const menu = await this.prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu não encontrado');
    if (menu.restaurantId !== ownerRestaurantId) {
      throw new ForbiddenException();
    }
  }

  async bulkCreateFromOcr(
    restaurantId: string,
    name: string,
    parsed: Array<{
      category: string;
      items: { name: string; price?: number; description?: string }[];
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const menu = await tx.menu.create({
        data: { restaurantId, name, isActive: true },
      });

      for (let idx = 0; idx < parsed.length; idx++) {
        const cat = parsed[idx];
        const category = await tx.menuCategory.create({
          data: {
            menuId: menu.id,
            name: cat.category || 'Sem Categoria',
            order: idx + 1,
          },
        });
        if (cat.items?.length) {
          await tx.menuItem.createMany({
            data: cat.items.map((i) => ({
              categoryId: category.id,
              name: i.name,
              price: i.price ?? 0,
              isAvailable: true,
            })),
          });
        }
      }

      return tx.menu.findUnique({
        where: { id: menu.id },
        include: {
          categories: { include: { items: true }, orderBy: { order: 'asc' } },
        },
      });
    });
  }
}
