import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { AiUgcService } from './ai-ugc.service';

@Controller('ai-ugc')
@UseGuards(ApiSecretGuard)
export class AiUgcController {
  constructor(private aiUgc: AiUgcService) {}

  @Get('avatars')
  listAvatars() {
    return this.aiUgc.listAvatars();
  }

  @Get()
  list() {
    return this.aiUgc.list();
  }

  @Post()
  create(
    @Body()
    body: {
      remixScriptId: string;
      avatarId: string;
      avatarName?: string;
      productAssetPath?: string;
    },
  ) {
    return this.aiUgc.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.aiUgc.get(id);
  }
}
