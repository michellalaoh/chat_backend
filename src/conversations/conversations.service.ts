import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '../db';
import {
  conversations,
  conversationMembers,
} from '../db/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ConversationsService {

  // =============================
  // DIRECT CHAT
  // =============================
  async createDirectConversation(
    currentUserId: string,
    targetUserId: string,
  ) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException(
        'Cannot create conversation with yourself',
      );
    }

    // 🔥 prevent duplicate direct chats
    const existing = await db
      .select({
        conversationId: conversationMembers.conversationId,
      })
      .from(conversationMembers)
      .where(
        eq(conversationMembers.userId, currentUserId),
      );

    // (simple version — later we optimize)
    for (const convo of existing) {
      const members = await db
        .select()
        .from(conversationMembers)
        .where(
          eq(
            conversationMembers.conversationId,
            convo.conversationId,
          ),
        );

      const ids = members.map((m) => m.userId);

      if (
        ids.length === 2 &&
        ids.includes(currentUserId) &&
        ids.includes(targetUserId)
      ) {
        return { id: convo.conversationId };
      }
    }

    // create conversation
    const [conversation] = await db
      .insert(conversations)
      .values({
        type: 'direct',
      })
      .returning();

    // add members
    await db.insert(conversationMembers).values([
      {
        conversationId: conversation.id,
        userId: currentUserId,
      },
      {
        conversationId: conversation.id,
        userId: targetUserId,
      },
    ]);

    return conversation;
  }

  // =============================
  // GROUP CHAT
  // =============================
  async createGroupConversation(
    creatorId: string,
    title: string | null,
    members: string[],
  ) {
    const uniqueMembers = Array.from(
      new Set([...members, creatorId]),
    );

    if (uniqueMembers.length < 2) {
      throw new BadRequestException(
        'Group must have at least 2 members',
      );
    }

    const [conversation] = await db
      .insert(conversations)
      .values({
        type: 'group',
        title,
      })
      .returning();

    await db.insert(conversationMembers).values(
      uniqueMembers.map((userId) => ({
        conversationId: conversation.id,
        userId,
      })),
    );

    return conversation;
  }
}