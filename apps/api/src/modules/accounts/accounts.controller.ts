import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@UseGuards(ApiSecretGuard)
export class AccountsController {
  constructor(private accounts: AccountsService) {}

  @Get()
  list() {
    return this.accounts.list();
  }

  @Post()
  create(
    @Body()
    body: {
      platform: 'tiktok' | 'instagram' | 'youtube';
      handle: string;
      displayName?: string;
      followerCount?: number;
      refreshIntervalDays?: number;
    },
  ) {
    return this.accounts.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.accounts.get(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accounts.remove(id);
  }
}
