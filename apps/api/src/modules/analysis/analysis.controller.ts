import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
@UseGuards(ApiSecretGuard)
export class AnalysisController {
  constructor(private analysis: AnalysisService) {}

  @Post()
  analyze(@Body() body: { sourceVideoId: string }) {
    return this.analysis.analyze(body.sourceVideoId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.analysis.get(id);
  }

  @Get('video/:sourceVideoId')
  getByVideo(@Param('sourceVideoId') sourceVideoId: string) {
    return this.analysis.getByVideo(sourceVideoId);
  }
}
