import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../services/ai.service';

// Endpoint simples de health/ping ou futura extração direta via URL
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('ping')
  ping() {
    return { ok: true, ts: Date.now() };
  }

  // Não é async pois não aguarda nada (remove warning require-await)
  @Post('extract-from-url')
  extractFromUrl(@Body('imageUrl') imageUrl: string) {
    return { message: 'Não implementado', imageUrl };
  }
}
