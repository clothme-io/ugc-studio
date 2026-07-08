import { Injectable, Inject } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { ugcExports } from '../../db/schema';

@Injectable()
export class ExportsService {
  constructor(@Inject(DB) private db: Database) {}

  async create(input: {
    editProjectId?: string;
    aiUgcJobId?: string;
    outputPath: string;
    caption?: string;
    hashtags?: string;
    targetAccountIds?: string[];
  }) {
    const [row] = await this.db
      .insert(ugcExports)
      .values({
        editProjectId: input.editProjectId,
        aiUgcJobId: input.aiUgcJobId,
        outputPath: input.outputPath,
        caption: input.caption,
        hashtags: input.hashtags,
        targetAccountIds: input.targetAccountIds,
      })
      .returning();
    return row;
  }

  async list() {
    return this.db
      .select()
      .from(ugcExports)
      .orderBy(desc(ugcExports.createdAt));
  }
}
