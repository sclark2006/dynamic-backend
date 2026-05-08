import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Use Node's built-in querystring parser so characters like { } " in q= values
  // are not interpreted as object delimiters (qs default behaviour strips them).
  app.set('query parser', 'simple');

  const config = new DocumentBuilder()
    .setTitle('Dynamic NestJS Backend')
    .setDescription('API documentation for Dynamic Backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3005;
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Listening on ${url}`);
  logger.log(`Swagger docs → ${url}/api/docs`);
}
bootstrap();
