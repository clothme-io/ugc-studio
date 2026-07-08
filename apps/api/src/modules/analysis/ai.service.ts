import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { VideoAnalysis, RemixScript } from '@ugc-studio/shared';
import { BRAND_CONTEXT } from '../../common/constants';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (key) {
      this.openai = new OpenAI({ apiKey: key });
    }
  }

  isConfigured(): boolean {
    return !!this.openai;
  }

  async analyzeVideo(input: {
    url: string;
    caption?: string;
    transcript?: string;
  }): Promise<{ analysis: VideoAnalysis; transcript: string }> {
    if (!this.openai) {
      return this.mockAnalysis(input);
    }

    const prompt = `Analyze this short-form UGC video for viral structure.
URL: ${input.url}
Caption: ${input.caption ?? 'unknown'}
Transcript: ${input.transcript ?? 'not available — infer from caption'}

Return JSON only with keys: format, hook, hookType, durationSec, structure (array of {segment, start, end, notes}), cta, textOverlays (array), musicStyle, replicabilityScore (0-10).`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content) as VideoAnalysis;
    return {
      analysis: parsed,
      transcript: input.transcript ?? parsed.hook,
    };
  }

  async remixScript(analysis: VideoAnalysis, brandContext?: string): Promise<RemixScript> {
    if (!this.openai) {
      return this.mockRemix(analysis);
    }

    const prompt = `Remix this viral video structure for ClothME (fashion sizing app).
Brand context: ${brandContext ?? BRAND_CONTEXT}
Original analysis: ${JSON.stringify(analysis)}

Return JSON with: hook, hookVariants (3 strings), body, cta, shotList (array of {segment, durationSec, visual, overlayText}), caption, hashtags (array).`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(content) as RemixScript;
  }

  private mockAnalysis(input: {
    url: string;
    caption?: string;
  }): { analysis: VideoAnalysis; transcript: string } {
    return {
      transcript: input.caption ?? 'Mock transcript — set OPENAI_API_KEY for real analysis.',
      analysis: {
        format: 'Problem → Demo → CTA',
        hook: 'I never know what size to order online',
        hookType: 'relatable_pain',
        durationSec: 28,
        structure: [
          { segment: 'hook', start: 0, end: 3 },
          { segment: 'problem', start: 3, end: 8 },
          { segment: 'demo', start: 8, end: 22 },
          { segment: 'cta', start: 22, end: 28 },
        ],
        cta: 'Link in bio',
        textOverlays: ['POV: ordering clothes online'],
        musicStyle: 'trending_audio',
        replicabilityScore: 8,
      },
    };
  }

  private mockRemix(analysis: VideoAnalysis): RemixScript {
    return {
      hook: `I returned 6 dresses until I tried ClothME's body scan`,
      hookVariants: [
        'Stop guessing your size — scan your body in 30 seconds',
        'POV: you finally order the right size every time',
        'This app ended my online shopping returns era',
      ],
      body: `Show the problem from "${analysis.hook}", then demo ClothME body scan on phone, show size recommendation, try on outfit that fits.`,
      cta: 'Download ClothME — link in bio',
      shotList: analysis.structure.map((s) => ({
        segment: s.segment,
        durationSec: s.end - s.start,
        visual: `Film ${s.segment} segment for ClothME`,
        overlayText: s.segment === 'hook' ? 'POV: sizing struggles' : undefined,
      })),
      caption: 'Never guess your size again 👗📱 #clothme #fashion #sizing',
      hashtags: ['clothme', 'fashion', 'sizing', 'tryon', 'bodyscan'],
    };
  }
}
