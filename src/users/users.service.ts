import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, type InferInsertModel } from 'drizzle-orm';

@Injectable()
export class UsersService {

  async createUser(data: InferInsertModel<typeof users>) {
    const [user] = await db
      .insert(users)
      .values(data)
      .returning();

    return user;
  }

  async getUser(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
  
    return user;
  }
}