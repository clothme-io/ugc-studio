import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { socialAccounts } from '../../db/schema';

@Injectable()
export class AccountsService {
  constructor(@Inject(DB) private db: Database) {}

  async list() {
    return this.db.select().from(socialAccounts).orderBy(socialAccounts.createdAt);
  }

  async create(input: {
    platform: 'tiktok' | 'instagram' | 'youtube';
    handle: string;
    displayName?: string;
    followerCount?: number;
    refreshIntervalDays?: number;
  }) {
    const [row] = await this.db
      .insert(socialAccounts)
      .values({
        platform: input.platform,
        handle: input.handle.replace('@', ''),
        displayName: input.displayName,
        followerCount: input.followerCount,
        refreshIntervalDays: input.refreshIntervalDays ?? 3,
      })
      .returning();
    return row;
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.id, id));
    if (!row) throw new NotFoundException('Account not found');
    return row;
  }

  async remove(id: string) {
    await this.db.delete(socialAccounts).where(eq(socialAccounts.id, id));
    return { deleted: true };
  }
}
