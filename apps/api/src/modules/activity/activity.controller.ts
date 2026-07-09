import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(ApiSecretGuard)
export class ActivityController {
  constructor(private activity: ActivityService) {}

  @Get()
  list() {
    return this.activity.list();
  }
}
