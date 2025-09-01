import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { UpdateOrderStatusDto } from '../dto/updateOrderStatus.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  // TODO: usar decorator @CurrentUser depois de implementar guard
  @Post()
  create(@Body() dto: CreateOrderDto) {
    const mockCustomerId = 'replace-with-auth-user-id';
    return this.service.create(mockCustomerId, dto);
  }

  @Get('me')
  myOrders() {
    const mockCustomerId = 'replace-with-auth-user-id';
    return this.service.listByCustomer(mockCustomerId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
