import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(ApiSecretGuard)
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @Get()
  list() {
    return this.exportsService.list();
  }

  @Post()
  create(
    @Body()
    body: {
      editProjectId?: string;
      aiUgcJobId?: string;
      outputPath: string;
      caption?: string;
      hashtags?: string;
      targetAccountIds?: string[];
    },
  ) {
    return this.exportsService.create(body);
  }
}
