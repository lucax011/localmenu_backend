import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, UserType } from '@prisma/client';
import { MenusService } from '../services/menus.service';
import { CreateMenuDto } from '../dto/createMenu.dto';
import { CreateMenuCategoryDto } from '../dto/createMenuCategory.dto';
import { UpdateMenuCategoryDto } from '../dto/updateMenuCategory.dto';
import { CreateMenuItemDto } from '../dto/createMenuItem.dto';
import { UpdateMenuItemDto } from '../dto/updateMenuItem.dto';
import { ImportMenuItemsDto } from '../dto/importMenuItems.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';

// Gestão do cardápio: só o dono do restaurante. O cliente lê o cardápio em /public.
@ApiTags('Menus')
@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.OWNER)
@ApiBearerAuth()
export class MenusController {
  constructor(private service: MenusService) {}

  @Post('item')
  addItem(@Body() dto: CreateMenuItemDto, @CurrentUser() user: User) {
    return this.service.addItem(dto, user.id);
  }

  @Patch('item/:id')
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateItem(id, dto, user.id);
  }

  @Delete('item/:id')
  deleteItem(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.deleteItem(id, user.id);
  }

  @Post('category/:menuId')
  addCategory(
    @Param('menuId') menuId: string,
    @Body() dto: CreateMenuCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.service.addCategory(menuId, dto, user.id);
  }

  @Patch('category/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateMenuCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateCategory(id, dto, user.id);
  }

  @Delete('category/:id')
  deleteCategory(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.deleteCategory(id, user.id);
  }

  @Post(':menuId/import')
  importItems(
    @Param('menuId') menuId: string,
    @Body() dto: ImportMenuItemsDto,
    @CurrentUser() user: User,
  ) {
    return this.service.importItems(menuId, dto, user.id);
  }

  @Get(':restaurantId')
  list(@Param('restaurantId') restaurantId: string, @CurrentUser() user: User) {
    return this.service.listMenus(restaurantId, user.id);
  }

  @Post(':restaurantId')
  createMenu(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuDto,
    @CurrentUser() user: User,
  ) {
    return this.service.createMenu(restaurantId, dto, user.id);
  }
}
