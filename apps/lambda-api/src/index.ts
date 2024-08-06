import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedServer;

export const getNestApp = async () => NestFactory.create(AppModule);

export const handler = async (event, context) => {
  if (!cachedServer) {
    const nestApp = await getNestApp();
    nestApp.enableCors();
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
