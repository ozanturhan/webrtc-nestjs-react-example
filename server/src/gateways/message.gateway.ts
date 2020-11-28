import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { Server } from 'ws';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'chat' })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeSockets: string[] = [];

  private logger: Logger = new Logger('MessageGateway');

  @SubscribeMessage('call-user')
  public callUser(client: Socket, data: any): void {
    client.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id,
    });
  }

  @SubscribeMessage('make-answer')
  public makeAnswer(client: Socket, data: any): void {
    client.to(data.to).emit('answer-made', {
      socket: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('reject-call')
  public rejectCall(client: Socket, data: any): void {
    client.to(data.from).emit('call-rejected', {
      socket: client.id,
    });
  }

  public afterInit(server: Server): void {
    return this.logger.log('Init');
  }

  public handleDisconnect(client: Socket): void {
    this.activeSockets = this.activeSockets.filter(
      (existingSocket) => existingSocket !== client.id,
    );

    client.broadcast.emit('remove-user', {
      socketId: client.id,
    });

    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  public handleConnection(client: Socket): void {
    const existingSocket = this.activeSockets.find(
      (existingSocket) => existingSocket === client.id,
    );

    if (!existingSocket) {
      this.activeSockets.push(client.id);

      client.emit('update-user-list', {
        users: this.activeSockets.filter(
          (existingSocket) => existingSocket !== client.id,
        ),
      });

      client.broadcast.emit('update-user-list', {
        users: [client.id],
      });
    }
    return this.logger.log(`Client connected: ${client.id}`);
  }
}
