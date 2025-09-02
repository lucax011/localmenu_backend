import { Module } from '@nestjs/common';
import { UploadsController } from '../controller/uploads.controller';
import { UploadsService } from '../services/uploads.service';
import { MenusModule } from '../../menus/module/menus.module';
import { AiModule } from '../../ai/module/ai.module';

@Module({
  imports: [MenusModule, AiModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
