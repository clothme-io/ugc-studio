import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HeyGenVideoJob {
  externalJobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
}

@Injectable()
export class HeyGenService {
  private apiKey: string | undefined;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('HEYGEN_API_KEY');
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async createVideo(input: {
    avatarId: string;
    script: string;
  }): Promise<HeyGenVideoJob> {
    if (!this.apiKey) {
      return {
        externalJobId: `mock-${Date.now()}`,
        status: 'completed',
        videoUrl: undefined,
      };
    }

    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: input.avatarId,
            },
            voice: {
              type: 'text',
              input_text: input.script,
            },
          },
        ],
        dimension: { width: 1080, height: 1920 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HeyGen API error: ${response.status} ${text}`);
    }

    const data = (await response.json()) as { data?: { video_id?: string } };
    return {
      externalJobId: data.data?.video_id ?? `unknown-${Date.now()}`,
      status: 'processing',
    };
  }

  async getVideoStatus(externalJobId: string): Promise<HeyGenVideoJob> {
    if (!this.apiKey || externalJobId.startsWith('mock-')) {
      return { externalJobId, status: 'completed' };
    }

    const response = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${externalJobId}`,
      { headers: { 'X-Api-Key': this.apiKey } },
    );

    if (!response.ok) {
      throw new Error(`HeyGen status error: ${response.status}`);
    }

    const data = (await response.json()) as {
      data?: { status?: string; video_url?: string };
    };
    const status = data.data?.status ?? 'processing';
    return {
      externalJobId,
      status:
        status === 'completed'
          ? 'completed'
          : status === 'failed'
            ? 'failed'
            : 'processing',
      videoUrl: data.data?.video_url,
    };
  }
}
