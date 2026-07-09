import { Injectable, Inject } from '@nestjs/common';
import { desc } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { remixScripts, sourceVideos, videoAnalyses } from '../../db/schema';

export type ActivityItem = {
  id: string;
  type: 'discovered' | 'analyzed' | 'remixed';
  label: string;
  href: string;
  createdAt: Date;
};

@Injectable()
export class ActivityService {
  constructor(@Inject(DB) private db: Database) {}

  async list(limit = 8): Promise<ActivityItem[]> {
    const [videos, analyses, remixes] = await Promise.all([
      this.db.select().from(sourceVideos).orderBy(desc(sourceVideos.createdAt)).limit(5),
      this.db.select().from(videoAnalyses).orderBy(desc(videoAnalyses.createdAt)).limit(5),
      this.db.select().from(remixScripts).orderBy(desc(remixScripts.createdAt)).limit(5),
    ]);

    const videoById = new Map(videos.map((v) => [v.id, v]));

    const items: ActivityItem[] = [
      ...videos.map((v) => ({
        id: `act-vid-${v.id}`,
        type: 'discovered' as const,
        label: `Discovered: ${v.caption?.slice(0, 50) ?? v.platform}`,
        href: `/research/videos/${v.id}`,
        createdAt: v.createdAt,
      })),
      ...analyses.map((a) => {
        const video = videoById.get(a.sourceVideoId);
        const hook = (a.analysis as { hook?: string })?.hook;
        return {
          id: `act-ana-${a.id}`,
          type: 'analyzed' as const,
          label: `Analyzed: ${hook?.slice(0, 50) ?? video?.platform ?? 'video'}`,
          href: `/research/analyze?videoId=${a.sourceVideoId}`,
          createdAt: a.createdAt,
        };
      }),
      ...remixes.map((r) => ({
        id: `act-remix-${r.id}`,
        type: 'remixed' as const,
        label: `Remixed: ${(r.script as { hook?: string })?.hook?.slice(0, 50) ?? 'ClothME script'}`,
        href: `/research/remix?analysisId=${r.analysisId}`,
        createdAt: r.createdAt,
      })),
    ];

    return items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
