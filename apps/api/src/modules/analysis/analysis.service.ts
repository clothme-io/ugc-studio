import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { videoAnalyses } from '../../db/schema';
import { AiService } from './ai.service';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class AnalysisService {
  constructor(
    @Inject(DB) private db: Database,
    private ai: AiService,
    private videos: VideosService,
  ) {}

  async analyze(sourceVideoId: string) {
    const video = await this.videos.get(sourceVideoId);
    const [pending] = await this.db
      .insert(videoAnalyses)
      .values({
        sourceVideoId,
        analysis: {},
        status: 'processing',
      })
      .returning();

    try {
      const result = await this.ai.analyzeVideo({
        url: video.externalUrl,
        caption: video.caption ?? undefined,
      });

      const [completed] = await this.db
        .update(videoAnalyses)
        .set({
          analysis: result.analysis,
          transcript: result.transcript,
          status: 'completed',
        })
        .where(eq(videoAnalyses.id, pending.id))
        .returning();

      return completed;
    } catch (err) {
      await this.db
        .update(videoAnalyses)
        .set({
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Analysis failed',
        })
        .where(eq(videoAnalyses.id, pending.id));
      throw err;
    }
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(videoAnalyses)
      .where(eq(videoAnalyses.id, id));
    if (!row) throw new NotFoundException('Analysis not found');
    return row;
  }

  async getByVideo(sourceVideoId: string) {
    const [row] = await this.db
      .select()
      .from(videoAnalyses)
      .where(eq(videoAnalyses.sourceVideoId, sourceVideoId));
    return row ?? null;
  }
}
