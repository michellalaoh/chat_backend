import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { messages } from '../db/schema';
import { lt, and, eq, desc } from 'drizzle-orm';
import { conversationMembers } from '../db/schema';
import { messageReceipts } from '../db/schema';

@Injectable()
export class MessagesService {

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    // 1️⃣ create message
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();
  
    // 2️⃣ get conversation members
    const members = await db
      .select()
      .from(conversationMembers)
      .where(
        eq(
          conversationMembers.conversationId,
          data.conversationId,
        ),
      );
  
    // 3️⃣ create receipts
    const receipts = members.map((m) => {
      const status: 'sent' | 'read' =
        m.userId === data.senderId
          ? 'read'
          : 'sent';
    
      return {
        messageId: message.id,
        userId: m.userId,
        status,
      };
    });
    
    await db.insert(messageReceipts).values(receipts);
  
    return message;
  }

  async markConversationAsRead(params: {
    conversationId: string;
    userId: string;
    lastSeenAt: string;
  }) {
    const { conversationId, userId, lastSeenAt } = params;
  
    await db
      .update(messageReceipts)
      .set({
        status: 'read',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(messageReceipts.userId, userId),
          lt(messageReceipts.updatedAt, new Date(lastSeenAt)),
          eq(messages.conversationId, conversationId),
        ),
      );
  }

  async getMessagesPaginated(params: {
    conversationId: string;
    cursor?: string;
    limit: number;
  }) {
    const { conversationId, cursor, limit } = params;
  
    const filters = [
      eq(messages.conversationId, conversationId),
    ];
  
    if (cursor) {
      filters.push(
        lt(messages.createdAt, new Date(cursor)),
      );
    }
  
    // fetch one extra message to know if more exist
    const result = await db
      .select()
      .from(messages)
      .where(and(...filters))
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1);
  
    // check if more messages exist
    const hasMore = result.length > limit;
  
    // remove extra item
    const messagesPage = hasMore
      ? result.slice(0, limit)
      : result;

    messagesPage.reverse();
  
    // cursor = oldest message returned
    const nextCursor =
      messagesPage.length > 0
        ? messagesPage[0].createdAt.toISOString()
        : null;
  
    return {
      messages: messagesPage,
      nextCursor,
      hasMore,
    };
  }

  async isUserInConversation(
    userId: string,
    conversationId: string,
  ) {
    const member = await db
      .select()
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.userId, userId),
          eq(conversationMembers.conversationId, conversationId),
        ),
      )
      .limit(1);
  
    return member.length > 0;
  }
}