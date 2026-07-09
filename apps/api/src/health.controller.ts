import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { StorageService } from './common/storage/storage.service';
import { AiService } from './modules/analysis/ai.service';
import { HeyGenService } from './modules/ai-ugc/heygen.service';
import { DB } from './db/db.module';
import type { Database } from './db';

@Controller()
export class HealthController {
  constructor(
    private ai: AiService,
    private heygen: HeyGenService,
    private storage: StorageService,
    @Inject(DB) private db: Database,
  ) {}

  @Get('health')
  async health() {
    let database: 'connected' | 'error' = 'error';
    try {
      await this.db.execute(sql`SELECT 1`);
      database = 'connected';
    } catch {
      database = 'error';
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      services: {
        database,
        openai: this.ai.isConfigured(),
        llm: this.ai.getStatus(),
        heygen: this.heygen.isConfigured(),
        storage: this.storage.storageMode(),
      },
    };
  }
}
