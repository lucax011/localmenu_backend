import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/createPayment.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';
import { User, UserType } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.CUSTOMER)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: User) {
    return this.service.create(user.id, dto);
  }

  @Get(':orderId')
  getByOrderId(@Param('orderId') orderId: string, @CurrentUser() user: User) {
    return this.service.findByOrderId(orderId, user.id);
  }
}
