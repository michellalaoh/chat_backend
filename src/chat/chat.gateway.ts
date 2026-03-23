import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  // ✅ user connects
  async handleConnection(client: any) {
    try {
      const token = client.handshake.auth?.token;
  
      if (!token) {
        client.disconnect();
        return;
      }
  
      const payload = await this.jwtService.verifyAsync(token);
  
      // attach user to socket
      client.user = payload;
  
      console.log('Socket authenticated:', payload.userId);
    } catch (err) {
      console.log('Socket auth failed');
      client.disconnect();
    }
  }

  // ✅ user disconnects
  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
  }

  // ===============================
  // JOIN CONVERSATION ROOM
  // ===============================
  @SubscribeMessage('joinConversation')
  joinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);

    console.log(
      `Client ${client.id} joined ${conversationId}`,
    );
  }

  // ===============================
  // SEND MESSAGE (REALTIME)
  // ===============================
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    body: {
      conversationId: string;
      senderId: string;
      content: string;
    },
  ) {
    // 1️⃣ save to DB
    const message =
      await this.messagesService.sendMessage(body);

    // 2️⃣ broadcast to room
    this.server
      .to(body.conversationId)
      .emit('newMessage', message);

    return message;
  }
}