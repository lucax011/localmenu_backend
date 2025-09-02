import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.Module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Serve Static Files
  app.use('/static', express.static(join(process.cwd(), 'uploads')));

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('LocaMenu API')
    .setDescription('API para o sistema de cardápios e pedidos LocaMenu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
