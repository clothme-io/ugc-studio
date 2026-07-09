import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { sourceVideos, videoAnalyses, remixScripts } from '../../db/schema';

function detectPlatform(url: string): 'tiktok' | 'instagram' | 'youtube' {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'tiktok';
}

function labelForVideo(video: { platform: string; caption: string | null; externalUrl: string }) {
  const snippet = video.caption?.slice(0, 60) ?? video.externalUrl.slice(0, 60);
  return `[${video.platform}] ${snippet}${snippet.length >= 60 ? '…' : ''}`;
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(@Inject(DB) private db: Database) {}

  async list() {
    try {
      const videos = await this.db
        .select()
        .from(sourceVideos)
        .orderBy(desc(sourceVideos.createdAt));

      if (videos.length === 0) return [];

      const videoIdSet = new Set(videos.map((v) => v.id));
      const allAnalyses = await this.db.select().from(videoAnalyses);
      const allRemixes = await this.db.select().from(remixScripts);

      const completedAnalyses = allAnalyses.filter(
        (a) => a.status === 'completed' && videoIdSet.has(a.sourceVideoId),
      );

      const analysisIdSet = new Set(completedAnalyses.map((a) => a.id));
      const remixes = allRemixes.filter((r) => analysisIdSet.has(r.analysisId));

      const analysisByVideoId = new Map(
        completedAnalyses.map((a) => [a.sourceVideoId, a]),
      );
      const remixCountByAnalysisId = remixes.reduce<Record<string, number>>((acc, r) => {
        acc[r.analysisId] = (acc[r.analysisId] ?? 0) + 1;
        return acc;
      }, {});

      return videos.map((v) => {
        const analysis = analysisByVideoId.get(v.id);
        const remixCount = analysis ? (remixCountByAnalysisId[analysis.id] ?? 0) : 0;
        const hook = analysis
          ? (analysis.analysis as { hook?: string })?.hook ?? null
          : null;

        return {
          ...v,
          label: labelForVideo(v),
          hook,
          remixCount,
          pipeline: {
            analyzed: !!analysis,
            remixed: remixCount > 0,
            analysisId: analysis?.id,
          },
        };
      });
    } catch (err) {
      this.logger.error('Failed to list videos', err);
      throw err;
    }
  }

  async ingest(input: { url: string; accountId?: string; caption?: string }) {
    const platform = detectPlatform(input.url);
    const [row] = await this.db
      .insert(sourceVideos)
      .values({
        platform,
        externalUrl: input.url,
        accountId: input.accountId,
        caption: input.caption ?? null,
        status: 'completed',
        viralScore: null,
      })
      .returning();
    return {
      ...row,
      label: labelForVideo(row),
      hook: null,
      remixCount: 0,
      pipeline: { analyzed: false, remixed: false },
    };
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(sourceVideos)
      .where(eq(sourceVideos.id, id));
    if (!row) throw new NotFoundException('Video not found');
    return { ...row, label: labelForVideo(row) };
  }

  async getDetail(id: string) {
    const video = await this.get(id);

    const [analysis] = await this.db
      .select()
      .from(videoAnalyses)
      .where(eq(videoAnalyses.sourceVideoId, id));

    let remixes: (typeof remixScripts.$inferSelect)[] = [];
    if (analysis) {
      remixes = await this.db
        .select()
        .from(remixScripts)
        .where(eq(remixScripts.analysisId, analysis.id));
    }

    return {
      video,
      analysis: analysis ?? null,
      remixes,
      pipeline: {
        discovered: true,
        analyzed: analysis?.status === 'completed',
        remixed: remixes.length > 0,
      },
    };
  }
}
