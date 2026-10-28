import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { PlainNumbersInterceptor } from './modules/common/interceptors/plainNumbers.interceptor';

// Configuração comum ao servidor (main.ts) e aos testes e2e
export function configureApp(app: INestApplication) {
  // Cabeçalhos de segurança. A API só devolve JSON, então a CSP fica desligada
  // (ela quebraria a página do Swagger em /docs). As fotos de /static são lidas
  // pelos apps em outra origem, por isso a política de recurso é cross-origin.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Só os apps locais (Expo Web) podem chamar a API pelo navegador
  const origins = (
    process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:19006'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

  // Preços (Decimal do Prisma) saem como número no JSON
  app.useGlobalInterceptors(new PlainNumbersInterceptor());

  // whitelist: campos que o DTO não declara são descartados (ex.: preço enviado pelo app)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Fotos de cardápio enviadas para o OCR
  app.use('/static', express.static(join(process.cwd(), 'uploads')));
  return app;
}
