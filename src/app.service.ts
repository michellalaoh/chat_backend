import { Injectable } from '@nestjs/common';
import { db } from './db/db';

@Injectable()
export class AppService {
  async getHello() {
    return {
      message: 'Backend working ✅',
      db: !!db,
    };
  }
}