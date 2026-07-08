import { Module } from '@nestjs/common';
import { ScriptsModule } from '../scripts/scripts.module';
import { AiUgcController } from './ai-ugc.controller';
import { AiUgcService } from './ai-ugc.service';
import { HeyGenService } from './heygen.service';

@Module({
  imports: [ScriptsModule],
  controllers: [AiUgcController],
  providers: [AiUgcService, HeyGenService],
  exports: [AiUgcService, HeyGenService],
})
export class AiUgcModule {}
