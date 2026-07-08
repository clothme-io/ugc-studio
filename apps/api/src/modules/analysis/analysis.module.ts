import { Module } from '@nestjs/common';
import { VideosModule } from '../videos/videos.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AiService } from './ai.service';

@Module({
  imports: [VideosModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AiService],
  exports: [AnalysisService, AiService],
})
export class AnalysisModule {}
