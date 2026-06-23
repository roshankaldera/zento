import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Gzip responses to shrink payloads over the wire.
  app.use(compression());

  // Allow the Next.js frontend (separate origin) to call the API.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
