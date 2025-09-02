import { Module } from '@nestjs/common';
import { MenusService } from '../services/menus.service';
import { MenusController } from '../controller/menus.controller';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';

@Module({
  providers: [MenusService, PrismaService],
  controllers: [MenusController],
  exports: [MenusService],
})
export class MenusModule {}
