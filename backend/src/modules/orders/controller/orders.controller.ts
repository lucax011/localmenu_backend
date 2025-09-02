import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { UpdateOrderStatusDto } from '../dto/updateOrderStatus.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { User, UserType } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserType.CUSTOMER)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.service.create(user.id, dto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserType.CUSTOMER)
  myOrders(@CurrentUser() user: User) {
    return this.service.listByCustomer(user.id);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserType.OWNER)
  restaurantOrders(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: User,
  ) {
    return this.service.listByRestaurant(restaurantId, user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserType.OWNER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateStatus(id, user.id, dto);
  }
}
