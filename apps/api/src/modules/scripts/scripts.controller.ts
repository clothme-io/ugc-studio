import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { assertUuid } from '../../common/uuid';
import { ScriptsService } from './scripts.service';

@Controller('scripts')
@UseGuards(ApiSecretGuard)
export class ScriptsController {
  constructor(private scripts: ScriptsService) {}

  @Get()
  list() {
    return this.scripts.list();
  }

  @Get('analysis/:analysisId')
  listByAnalysis(@Param('analysisId', ParseUUIDPipe) analysisId: string) {
    return this.scripts.listByAnalysis(analysisId);
  }

  @Post('remix')
  remix(@Body() body: { analysisId: string; brandContext?: string }) {
    assertUuid(body.analysisId, 'analysisId');
    return this.scripts.remix(body.analysisId, body.brandContext);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.scripts.get(id);
  }
}
