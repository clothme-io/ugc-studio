import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { videoAnalyses, sourceVideos, remixScripts } from '../../db/schema';
import { AiService } from './ai.service';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class AnalysisService {
  constructor(
    @Inject(DB) private db: Database,
    private ai: AiService,
    private videos: VideosService,
  ) {}

  async listCompleted() {
    const rows = await this.db
      .select({
        analysis: videoAnalyses,
        video: sourceVideos,
      })
      .from(videoAnalyses)
      .innerJoin(sourceVideos, eq(videoAnalyses.sourceVideoId, sourceVideos.id))
      .where(eq(videoAnalyses.status, 'completed'))
      .orderBy(desc(videoAnalyses.createdAt));

    return rows.map(({ analysis, video }) => ({
      id: analysis.id,
      sourceVideoId: video.id,
      status: analysis.status,
      createdAt: analysis.createdAt,
      label: `[${video.platform}] ${video.caption?.slice(0, 50) ?? video.externalUrl.slice(0, 50)}…`,
      hook: (analysis.analysis as { hook?: string })?.hook ?? null,
      video,
    }));
  }

  async analyze(sourceVideoId: string) {
    const video = await this.videos.get(sourceVideoId);

    const existing = await this.getByVideo(sourceVideoId);
    if (existing?.status === 'completed') {
      return existing;
    }

    if (existing) {
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
            errorMessage: null,
          })
          .where(eq(videoAnalyses.id, existing.id))
          .returning();

        return completed;
      } catch (err) {
        await this.db
          .update(videoAnalyses)
          .set({
            status: 'failed',
            errorMessage: err instanceof Error ? err.message : 'Analysis failed',
          })
          .where(eq(videoAnalyses.id, existing.id));
        throw err;
      }
    }

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

  async getWithRemixes(id: string) {
    const analysis = await this.get(id);
    const remixes = await this.db
      .select()
      .from(remixScripts)
      .where(eq(remixScripts.analysisId, id));
    return { analysis, remixes };
  }
}
