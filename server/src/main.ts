import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import * as helmet from 'helmet';

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number): any {
    const server = super.createIOServer(port);
    const redisAdapter = redisIoAdapter({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_PASSWORD,
    });
    server.adapter(redisAdapter);
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin:
        process.env.REDIS_HOST === 'localhost'
          ? '*'
          : 'https://react-socket-io-webrtc-client.herokuapp.com',
    },
  });
  app.use(helmet());
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  console.log('Port', process.env.PORT);
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
