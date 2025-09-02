import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/createPayment.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
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

  // Mock endpoint para simular um webhook de pagamento bem-sucedido
  @Post('webhook/success')
  mockPaymentSuccess(@Body() body: { transactionId: string }) {
    return this.service.handleSuccessfulPayment(body.transactionId);
  }
}
