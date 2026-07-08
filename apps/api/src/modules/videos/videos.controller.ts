import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { VideosService } from './videos.service';

@Controller('videos')
@UseGuards(ApiSecretGuard)
export class VideosController {
  constructor(private videos: VideosService) {}

  @Get()
  list() {
    return this.videos.list();
  }

  @Post('ingest')
  ingest(@Body() body: { url: string; accountId?: string; caption?: string }) {
    return this.videos.ingest(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.videos.get(id);
  }
}
