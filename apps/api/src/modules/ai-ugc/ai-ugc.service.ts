import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { RemixScript } from '@ugc-studio/shared';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { aiUgcJobs } from '../../db/schema';
import { HEYGEN_AVATARS } from '../../common/constants';
import { HeyGenService } from './heygen.service';
import { ScriptsService } from '../scripts/scripts.service';

@Injectable()
export class AiUgcService {
  constructor(
    @Inject(DB) private db: Database,
    private heygen: HeyGenService,
    private scripts: ScriptsService,
  ) {}

  listAvatars() {
    return HEYGEN_AVATARS;
  }

  async create(input: {
    remixScriptId: string;
    avatarId: string;
    avatarName?: string;
    productAssetPath?: string;
  }) {
    const scriptRow = await this.scripts.get(input.remixScriptId);
    const script = scriptRow.script as RemixScript;
    const fullScript = [script.hook, script.body, script.cta].join(' ');

    const [job] = await this.db
      .insert(aiUgcJobs)
      .values({
        remixScriptId: input.remixScriptId,
        avatarId: input.avatarId,
        avatarName: input.avatarName,
        productAssetPath: input.productAssetPath,
        status: 'processing',
      })
      .returning();

    try {
      const heygenJob = await this.heygen.createVideo({
        avatarId: input.avatarId,
        script: fullScript,
      });

      const [updated] = await this.db
        .update(aiUgcJobs)
        .set({
          externalJobId: heygenJob.externalJobId,
          outputPath: heygenJob.videoUrl,
          status: heygenJob.status,
          updatedAt: new Date(),
        })
        .where(eq(aiUgcJobs.id, job.id))
        .returning();

      return updated;
    } catch (err) {
      await this.db
        .update(aiUgcJobs)
        .set({
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'AI UGC failed',
          updatedAt: new Date(),
        })
        .where(eq(aiUgcJobs.id, job.id));
      throw err;
    }
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(aiUgcJobs)
      .where(eq(aiUgcJobs.id, id));
    if (!row) throw new NotFoundException('AI UGC job not found');

    if (row.externalJobId && row.status === 'processing') {
      const status = await this.heygen.getVideoStatus(row.externalJobId);
      if (status.status !== row.status || status.videoUrl) {
        const [updated] = await this.db
          .update(aiUgcJobs)
          .set({
            status: status.status,
            outputPath: status.videoUrl ?? row.outputPath,
            updatedAt: new Date(),
          })
          .where(eq(aiUgcJobs.id, id))
          .returning();
        return updated;
      }
    }

    return row;
  }

  async list() {
    return this.db.select().from(aiUgcJobs);
  }
}
