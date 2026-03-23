import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { messages } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MessagesService {

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();

    return message;
  }

  async getMessages(conversationId: string) {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));
  }
}