import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { MenusService } from '../services/menus.service';
import { CreateMenuDto } from '../dto/createMenu.dto';
import { CreateMenuCategoryDto } from '../dto/createMenuCategory.dto';
import { CreateMenuItemDto } from '../dto/createMenuItem.dto';
import { UpdateMenuItemDto } from '../dto/updateMenuItem.dto';

@Controller('menus')
export class MenusController {
  constructor(private service: MenusService) {}

  @Post(':restaurantId')
  createMenu(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuDto,
  ) {
    return this.service.createMenu(restaurantId, dto);
  }

  @Get(':restaurantId')
  list(@Param('restaurantId') restaurantId: string) {
    return this.service.listMenus(restaurantId);
  }

  @Post('category/:menuId')
  addCategory(
    @Param('menuId') menuId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.service.addCategory(menuId, dto);
  }

  @Post('item')
  addItem(@Body() dto: CreateMenuItemDto) {
    return this.service.addItem(dto);
  }

  @Patch('item/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Delete('item/:id')
  deleteItem(@Param('id') id: string) {
    return this.service.deleteItem(id);
  }
}
