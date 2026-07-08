import { Controller, Get } from '@nestjs/common';
import { AiService } from './modules/analysis/ai.service';
import { HeyGenService } from './modules/ai-ugc/heygen.service';

@Controller()
export class HealthController {
  constructor(
    private ai: AiService,
    private heygen: HeyGenService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      services: {
        openai: this.ai.isConfigured(),
        heygen: this.heygen.isConfigured(),
      },
    };
  }
}
