import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateMenuDto } from '../dto/createMenu.dto';
import { CreateMenuCategoryDto } from '../dto/createMenuCategory.dto';
import { UpdateMenuCategoryDto } from '../dto/updateMenuCategory.dto';
import { CreateMenuItemDto } from '../dto/createMenuItem.dto';
import { UpdateMenuItemDto } from '../dto/updateMenuItem.dto';
import { ImportMenuItemsDto } from '../dto/importMenuItems.dto';

export const MENU_TREE = {
  categories: {
    orderBy: { order: 'asc' },
    include: { items: { orderBy: [{ order: 'asc' }, { name: 'asc' }] } },
  },
} satisfies Prisma.MenuInclude;

// Toda escrita confere se o cardápio pertence a um restaurante do usuário.
@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async createMenu(restaurantId: string, dto: CreateMenuDto, ownerId: string) {
    await this.ensureRestaurantOwner(restaurantId, ownerId);
    const exists = await this.prisma.menu.findUnique({
      where: { restaurantId_name: { restaurantId, name: dto.name } },
    });
    if (exists) {
      throw new ConflictException('Já existe um cardápio com esse nome.');
    }
    return this.prisma.menu.create({
      data: { restaurantId, name: dto.name, isActive: true },
      include: MENU_TREE,
    });
  }

  async listMenus(restaurantId: string, ownerId: string) {
    await this.ensureRestaurantOwner(restaurantId, ownerId);
    return this.prisma.menu.findMany({
      where: { restaurantId },
      include: MENU_TREE,
      orderBy: { createdAt: 'asc' },
    });
  }

  async addCategory(
    menuId: string,
    dto: CreateMenuCategoryDto,
    ownerId: string,
  ) {
    await this.ensureMenuOwner(menuId, ownerId);
    return this.prisma.menuCategory.create({
      data: {
        menuId,
        name: dto.name,
        order: dto.sortOrder ?? (await this.nextCategoryOrder(menuId)),
      },
      include: { items: true },
    });
  }

  async updateCategory(
    id: string,
    dto: UpdateMenuCategoryDto,
    ownerId: string,
  ) {
    const category = await this.findCategory(id);
    await this.ensureMenuOwner(category.menuId, ownerId);
    return this.prisma.menuCategory.update({
      where: { id },
      data: { name: dto.name, order: dto.sortOrder },
      include: { items: true },
    });
  }

  async deleteCategory(id: string, ownerId: string) {
    const category = await this.findCategory(id);
    await this.ensureMenuOwner(category.menuId, ownerId);
    const ordered = await this.prisma.orderItem.count({
      where: { menuItem: { categoryId: id } },
    });
    if (ordered) {
      throw new ConflictException(
        'Esta categoria tem itens que já foram pedidos. Pause os itens em vez de remover.',
      );
    }
    await this.prisma.menuCategory.delete({ where: { id } });
    return { success: true };
  }

  async addItem(dto: CreateMenuItemDto, ownerId: string) {
    const category = await this.findCategory(dto.categoryId);
    await this.ensureMenuOwner(category.menuId, ownerId);
    return this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isAvailable: dto.isAvailable ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  async updateItem(id: string, dto: UpdateMenuItemDto, ownerId: string) {
    const item = await this.findItem(id);
    await this.ensureMenuOwner(item.category.menuId, ownerId);
    if (dto.categoryId && dto.categoryId !== item.categoryId) {
      // mover de categoria só dentro do mesmo cardápio
      const target = await this.findCategory(dto.categoryId);
      if (target.menuId !== item.category.menuId) {
        throw new ForbiddenException('A categoria é de outro cardápio.');
      }
    }
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  async deleteItem(id: string, ownerId: string) {
    const item = await this.findItem(id);
    await this.ensureMenuOwner(item.category.menuId, ownerId);
    const ordered = await this.prisma.orderItem.count({
      where: { menuItemId: id },
    });
    if (ordered) {
      throw new ConflictException(
        'Este item já foi pedido e fica no histórico. Pause o item em vez de remover.',
      );
    }
    await this.prisma.menuItem.delete({ where: { id } });
    return { success: true };
  }

  // Publica os itens revisados de uma importação por foto
  async importItems(menuId: string, dto: ImportMenuItemsDto, ownerId: string) {
    await this.ensureMenuOwner(menuId, ownerId);
    let jobId: string | undefined;
    if (dto.uploadId) {
      const upload = await this.prisma.menuUpload.findUnique({
        where: { id: dto.uploadId },
        include: { aiJob: true },
      });
      if (!upload || upload.menuId !== menuId) {
        throw new NotFoundException(
          'Importação não encontrada neste cardápio.',
        );
      }
      jobId = upload.aiJob?.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const categories = await tx.menuCategory.findMany({ where: { menuId } });
      const byName = new Map(
        categories.map((c) => [c.name.toLowerCase(), c.id]),
      );
      let nextOrder = Math.max(0, ...categories.map((c) => c.order)) + 1;
      for (const item of dto.items) {
        const name = (item.category || 'Importados').trim();
        let categoryId = byName.get(name.toLowerCase());
        if (!categoryId) {
          const category = await tx.menuCategory.create({
            data: { menuId, name, order: nextOrder++ },
          });
          categoryId = category.id;
          byName.set(name.toLowerCase(), categoryId);
        }
        await tx.menuItem.create({
          data: {
            categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            confidence: item.confidence,
            extractedById: jobId,
          },
        });
      }
      const menu = await tx.menu.findUnique({
        where: { id: menuId },
        include: MENU_TREE,
      });
      return { created: dto.items.length, menu };
    });
  }

  // cardápio principal do restaurante, criado na primeira vez
  async mainMenu(restaurantId: string) {
    const existing = await this.prisma.menu.findFirst({
      where: { restaurantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return (
      existing ??
      this.prisma.menu.create({
        data: { restaurantId, name: 'Cardápio Principal' },
      })
    );
  }

  async ensureRestaurantOwner(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante não encontrado.');
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return restaurant;
  }

  private async ensureMenuOwner(menuId: string, ownerId: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true },
    });
    if (!menu) throw new NotFoundException('Cardápio não encontrado.');
    if (menu.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return menu;
  }

  private async findCategory(id: string) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada.');
    return category;
  }

  private async findItem(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!item) throw new NotFoundException('Item não encontrado.');
    return item;
  }

  private async nextCategoryOrder(menuId: string) {
    const max = await this.prisma.menuCategory.aggregate({
      where: { menuId },
      _max: { order: true },
    });
    return (max._max.order ?? 0) + 1;
  }
}
