import { Module } from '@nestjs/common';
import { MessageGateway } from './gateways/message.gateway';
import { ConfigModule } from '@nestjs/config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
  ],
  controllers: [],
  providers: [MessageGateway],
})
export class AppModule {}
