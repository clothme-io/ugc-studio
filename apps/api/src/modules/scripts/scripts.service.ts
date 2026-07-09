import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { VideoAnalysis } from '@ugc-studio/shared';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { remixScripts } from '../../db/schema';
import { AiService } from '../analysis/ai.service';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class ScriptsService {
  constructor(
    @Inject(DB) private db: Database,
    private ai: AiService,
    private analysis: AnalysisService,
  ) {}

  async list() {
    return this.db.select().from(remixScripts).orderBy(desc(remixScripts.createdAt));
  }

  async listByAnalysis(analysisId: string) {
    return this.db
      .select()
      .from(remixScripts)
      .where(eq(remixScripts.analysisId, analysisId))
      .orderBy(desc(remixScripts.createdAt));
  }

  async remix(analysisId: string, brandContext?: string) {
    const analysisRow = await this.analysis.get(analysisId);
    const script = await this.ai.remixScript(
      analysisRow.analysis as VideoAnalysis,
      brandContext,
    );

    const [row] = await this.db
      .insert(remixScripts)
      .values({
        analysisId,
        script,
        brandContext,
      })
      .returning();

    return row;
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(remixScripts)
      .where(eq(remixScripts.id, id));
    if (!row) throw new NotFoundException('Script not found');
    return row;
  }
}
