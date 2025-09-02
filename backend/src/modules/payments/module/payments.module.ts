import { Module } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsController } from '../controller/payments.controller';
import { PrismaModule } from '../../prisma/module/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
