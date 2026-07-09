import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { AvatarsService } from './avatars.service';

@Controller('avatars')
@UseGuards(ApiSecretGuard)
export class AvatarsController {
  constructor(private avatars: AvatarsService) {}

  @Get()
  list() {
    return this.avatars.list();
  }

  @Post()
  create(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      age?: number;
      jobTitle?: string;
      company?: string;
      location?: string;
      bio?: string;
      heygenAvatarId?: string;
      photoUrl?: string;
      voiceStyle?: string;
    },
  ) {
    return this.avatars.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.avatars.get(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      age?: number;
      jobTitle?: string;
      company?: string;
      location?: string;
      bio?: string;
      heygenAvatarId?: string;
      photoUrl?: string;
      voiceStyle?: string;
      isActive?: boolean;
    },
  ) {
    return this.avatars.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avatars.remove(id);
  }
}
