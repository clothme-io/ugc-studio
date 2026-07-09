import { Injectable, Inject } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { StorageService } from '../../common/storage/storage.service';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { ugcExports } from '../../db/schema';

@Injectable()
export class ExportsService {
  constructor(
    @Inject(DB) private db: Database,
    private storage: StorageService,
  ) {}

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

    return {
      ...row,
      downloadUrl: this.storage.resolveDownloadUrl(input.outputPath),
    };
  }

  async list() {
    const rows = await this.db
      .select()
      .from(ugcExports)
      .orderBy(desc(ugcExports.createdAt));

    return rows.map((row) => ({
      ...row,
      downloadUrl: this.storage.resolveDownloadUrl(row.outputPath),
    }));
  }
}
