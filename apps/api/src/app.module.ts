import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DbModule } from './db/db.module';
import { HealthController } from './health.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { VideosModule } from './modules/videos/videos.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ScriptsModule } from './modules/scripts/scripts.module';
import { EditorModule } from './modules/editor/editor.module';
import { AiUgcModule } from './modules/ai-ugc/ai-ugc.module';
import { AvatarsModule } from './modules/avatars/avatars.module';
import { ExportsModule } from './modules/exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), '../../.env'),
      ],
    }),
    DbModule,
    AccountsModule,
    VideosModule,
    AnalysisModule,
    ScriptsModule,
    EditorModule,
    AiUgcModule,
    AvatarsModule,
    ExportsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
