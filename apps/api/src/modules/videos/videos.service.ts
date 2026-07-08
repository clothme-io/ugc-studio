import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { sourceVideos } from '../../db/schema';

function detectPlatform(url: string): 'tiktok' | 'instagram' | 'youtube' {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'tiktok';
}

@Injectable()
export class VideosService {
  constructor(@Inject(DB) private db: Database) {}

  async list() {
    return this.db
      .select()
      .from(sourceVideos)
      .orderBy(desc(sourceVideos.viralScore), desc(sourceVideos.createdAt));
  }

  async ingest(input: { url: string; accountId?: string; caption?: string }) {
    const platform = detectPlatform(input.url);
    const [row] = await this.db
      .insert(sourceVideos)
      .values({
        platform,
        externalUrl: input.url,
        accountId: input.accountId,
        caption: input.caption,
        status: 'completed',
        viralScore: Math.random() * 10,
      })
      .returning();
    return row;
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(sourceVideos)
      .where(eq(sourceVideos.id, id));
    if (!row) throw new NotFoundException('Video not found');
    return row;
  }
}
