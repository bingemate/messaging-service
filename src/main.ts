import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const swaggerConfig = (): DocumentBuilder => {
  return new DocumentBuilder()
    .setTitle('Messaging service swagger')
    .setVersion('v1.0');
};

export const initSwagger = (app: INestApplication) => {
  const document = SwaggerModule.createDocument(app, swaggerConfig().build());
  SwaggerModule.setup('openapi', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  initSwagger(app);
  await app.listen(process.env.SERVER_PORT || 3000);
}
bootstrap();
