import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiService } from '../services/ai.service';
import { AiController } from '../controller/ai.controller';

@Module({
  imports: [HttpModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
