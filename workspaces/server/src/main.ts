import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GameIoAdapter } from '@app/websocket/game-io.adapter';
import { AppModule } from '@app/app.module';

async function bootstrap()
{
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useWebSocketAdapter(new GameIoAdapter(app));

  app.enableCors({
    origin: process.env.CORS_ALLOW_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.disable('x-powered-by');
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  console.log(process.env.PORT)
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
