import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.Module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = configureApp(await NestFactory.create(AppModule));

  // Documentação interativa em /docs
  const config = new DocumentBuilder()
    .setTitle('LocalMenu API')
    .setDescription(
      'API do LocalMenu: cardápios digitais e pedidos para retirada',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
