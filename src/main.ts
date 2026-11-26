import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  // deixa as fotos enviadas acessíveis em http://localhost:3001/uploads/...
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // whitelist descarta campos que não existem no dto (ex.: "papel" no cadastro).
  // transform aplica as conversões dos dtos, ex.: o id "3" que chega de um formulário vira o número 3
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();