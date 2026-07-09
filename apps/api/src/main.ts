import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3100' });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`UGC Studio API running on http://localhost:${port}`);
}

bootstrap();
