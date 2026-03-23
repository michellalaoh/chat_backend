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
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) { }

  @WebSocketServer()
  server: Server;

  // ✅ user connects
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('No token');
      }

      const payload = await this.jwtService.verifyAsync(token);

      // ✅ attach user to socket
      client.data.user = payload;

      console.log(
        `User connected: ${payload.userId} (${client.id})`,
      );
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
  async joinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    // ✅ verify user belongs to conversation
    const isMember =
      await this.messagesService.isUserInConversation(
        user.userId,
        conversationId,
      );

    if (!isMember) {
      return { error: 'Unauthorized' };
    }

    client.join(conversationId);

    console.log(
      `User ${user.userId} joined ${conversationId}`,
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
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    // ✅ backend decides sender
    const message =
      await this.messagesService.sendMessage({
        conversationId: body.conversationId,
        senderId: user.userId,
        content: body.content,
      });

    this.server
      .to(body.conversationId)
      .emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('readConversation')
  async readConversation(
    @MessageBody()
    body: {
      conversationId: string;
      lastSeenAt: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.userId;

    await this.messagesService.markConversationAsRead({
      conversationId: body.conversationId,
      userId,
      lastSeenAt: body.lastSeenAt,
    });

    this.server
      .to(body.conversationId)
      .emit('conversationRead', {
        userId,
        conversationId: body.conversationId,
        lastSeenAt: body.lastSeenAt,
      });
  }
}