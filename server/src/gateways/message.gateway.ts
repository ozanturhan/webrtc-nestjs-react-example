import {
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
export class MessageGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeSockets: { room: string; id: string }[] = [];

  private logger: Logger = new Logger('MessageGateway');

  @SubscribeMessage('joinRoom')
  public joinRoom(client: Socket, room: string): void {
    /*
    client.join(room);
    client.emit('joinedRoom', room);
    */

    const existingSocket = this.activeSockets?.find(
      (socket) => socket.room === room && socket.id === client.id,
    );

    if (!existingSocket) {
      this.activeSockets = [...this.activeSockets, { id: client.id, room }];
      client.emit(`${room}-update-user-list`, {
        users: this.activeSockets
          .filter((socket) => socket.room === room && socket.id !== client.id)
          .map((existingSocket) => existingSocket.id),
        current: client.id,
      });

      client.broadcast.emit(`${room}-add-user`, {
        user: client.id,
      });
    }

    return this.logger.log(`Client ${client.id} joined ${room}`);
  }

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
    this.logger.log('Init');
  }

  public handleDisconnect(client: Socket): void {
    const existingSocket = this.activeSockets.find(
      (socket) => socket.id === client.id,
    );

    if (!existingSocket) return;

    this.activeSockets = this.activeSockets.filter(
      (socket) => socket.id !== client.id,
    );

    client.broadcast.emit(`${existingSocket.room}-remove-user`, {
      socketId: client.id,
    });

    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
