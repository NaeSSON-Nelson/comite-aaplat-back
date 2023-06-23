import { NestFactory } from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common/';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:'http://localhost:4200'
  })
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist:            true,
    forbidNonWhitelisted: true,
    
  }))
  await app.listen(3000);
}
bootstrap();
