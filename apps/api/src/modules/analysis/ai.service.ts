import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { VideoAnalysis, RemixScript } from '@ugc-studio/shared';
import { BRAND_CONTEXT } from '../../common/constants';

export type LlmProvider = 'openai' | 'openrouter';

export type LlmStatus = {
  configured: boolean;
  provider: LlmProvider | null;
  model: string | null;
};

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

@Injectable()
export class AiService {
  private client: OpenAI | null = null;
  private provider: LlmProvider | null = null;
  private model: string | null = null;

  constructor(private config: ConfigService) {
    this.initClient();
  }

  private initClient() {
    const explicit = this.config.get<string>('AI_PROVIDER')?.toLowerCase();
    const openrouterKey = this.config.get<string>('OPENROUTER_API_KEY');
    const openaiKey = this.config.get<string>('OPENAI_API_KEY');

    let provider: LlmProvider | null = null;
    if (explicit === 'openrouter' || explicit === 'openai') {
      provider = explicit;
    } else if (openrouterKey) {
      provider = 'openrouter';
    } else if (openaiKey) {
      provider = 'openai';
    }

    if (!provider) return;

    if (provider === 'openrouter') {
      if (!openrouterKey) return;
      this.provider = 'openrouter';
      this.model =
        this.config.get<string>('OPENROUTER_MODEL') ??
        this.config.get<string>('AI_MODEL') ??
        'openai/gpt-4o-mini';

      const referer = this.config.get<string>('OPENROUTER_HTTP_REFERER');
      const appName = this.config.get<string>('OPENROUTER_APP_NAME') ?? 'UGC Studio';

      this.client = new OpenAI({
        apiKey: openrouterKey,
        baseURL: OPENROUTER_BASE_URL,
        defaultHeaders: {
          ...(referer ? { 'HTTP-Referer': referer } : {}),
          'X-Title': appName,
        },
      });
      return;
    }

    if (!openaiKey) return;
    this.provider = 'openai';
    this.model =
      this.config.get<string>('OPENAI_MODEL') ??
      this.config.get<string>('AI_MODEL') ??
      'gpt-4o-mini';
    this.client = new OpenAI({ apiKey: openaiKey });
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  getStatus(): LlmStatus {
    return {
      configured: this.isConfigured(),
      provider: this.provider,
      model: this.model,
    };
  }

  private requireClient(): OpenAI {
    if (!this.client || !this.model) {
      throw new ServiceUnavailableException(
        'Set OPENROUTER_API_KEY or OPENAI_API_KEY for video analysis and script remix',
      );
    }
    return this.client;
  }

  private async chatJson(prompt: string): Promise<string> {
    const client = this.requireClient();
    try {
      const response = await client.chat.completions.create({
        model: this.model!,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      return response.choices[0]?.message?.content ?? '{}';
    } catch (err) {
      if (err instanceof OpenAI.APIError) {
        if (err.status === 402) {
          throw new ServiceUnavailableException(
            'OpenRouter credits exhausted. Add credits at https://openrouter.ai/settings/credits or set OPENAI_API_KEY in .env to use direct OpenAI.',
          );
        }
        throw new ServiceUnavailableException(`LLM request failed (${err.status}): ${err.message}`);
      }
      throw err;
    }
  }

  async analyzeVideo(input: {
    url: string;
    caption?: string;
    transcript?: string;
  }): Promise<{ analysis: VideoAnalysis; transcript: string }> {
    const prompt = `Analyze this short-form UGC video for viral structure.
URL: ${input.url}
Caption: ${input.caption ?? 'unknown'}
Transcript: ${input.transcript ?? 'not available — infer from caption'}

Return JSON only with keys: format, hook, hookType, durationSec, structure (array of {segment, start, end, notes}), cta, textOverlays (array), musicStyle, replicabilityScore (0-10).`;

    const content = await this.chatJson(prompt);
    const parsed = JSON.parse(content) as VideoAnalysis;
    return {
      analysis: parsed,
      transcript: input.transcript ?? parsed.hook,
    };
  }

  async remixScript(analysis: VideoAnalysis, brandContext?: string): Promise<RemixScript> {
    const prompt = `Remix this viral video structure for ClothME (fashion sizing app).
Brand context: ${brandContext ?? BRAND_CONTEXT}
Original analysis: ${JSON.stringify(analysis)}

Return JSON with: hook, hookVariants (3 strings), body, cta, shotList (array of {segment, durationSec, visual, overlayText}), caption, hashtags (array).`;

    const content = await this.chatJson(prompt);
    return JSON.parse(content) as RemixScript;
  }
}
