import type {
  AnalyzedVideoOption,
  AvatarProfile,
  RemixScriptRecord,
  SourceVideo,
  VideoAnalysisRecord,
  VideoDetail,
} from '@ugc-studio/shared';

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

// ── Seed data ──────────────────────────────────────────────────────────

const seedVideos: SourceVideo[] = [
  {
    id: 'vid-001',
    platform: 'tiktok',
    externalUrl: 'https://www.tiktok.com/@fashioncreator/video/7123456789',
    caption: 'POV: you finally order the right size every time',
    viralScore: 8.7,
    status: 'completed',
    createdAt: daysAgo(2),
    label: '[tiktok] POV: you finally order the right size every time',
    hook: 'I returned 6 dresses last month until I found this app',
    remixCount: 1,
    pipeline: { analyzed: true, remixed: true, analysisId: 'ana-001' },
  },
  {
    id: 'vid-002',
    platform: 'instagram',
    externalUrl: 'https://www.instagram.com/reel/CxYzAbCdEf/',
    caption: 'Stop guessing your size — this changed everything for me',
    viralScore: 9.1,
    status: 'completed',
    createdAt: daysAgo(1),
    label: '[instagram] Stop guessing your size — this changed everything for me',
    hook: 'Stop guessing your size — scan your body in 30 seconds',
    remixCount: 0,
    pipeline: { analyzed: true, remixed: false, analysisId: 'ana-002' },
  },
  {
    id: 'vid-003',
    platform: 'tiktok',
    externalUrl: 'https://www.tiktok.com/@styletips/video/7987654321',
    caption: 'GRWM but make it a sizing hack',
    viralScore: 7.4,
    status: 'completed',
    createdAt: daysAgo(0),
    label: '[tiktok] GRWM but make it a sizing hack',
    hook: null,
    remixCount: 0,
    pipeline: { analyzed: false, remixed: false },
  },
];

const seedAnalyses: VideoAnalysisRecord[] = [
  {
    id: 'ana-001',
    sourceVideoId: 'vid-001',
    status: 'completed',
    createdAt: daysAgo(1),
    transcript: 'I returned 6 dresses last month...',
    analysis: {
      format: 'Problem → Demo → CTA',
      hook: 'I returned 6 dresses last month until I found this app',
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
      replicabilityScore: 8.5,
    },
  },
  {
    id: 'ana-002',
    sourceVideoId: 'vid-002',
    status: 'completed',
    createdAt: daysAgo(0),
    transcript: 'Stop guessing your size...',
    analysis: {
      format: 'Hook → Quick demo → CTA',
      hook: 'Stop guessing your size — scan your body in 30 seconds',
      hookType: 'bold_claim',
      durationSec: 22,
      structure: [
        { segment: 'hook', start: 0, end: 4 },
        { segment: 'demo', start: 4, end: 18 },
        { segment: 'cta', start: 18, end: 22 },
      ],
      cta: 'Download free — link in bio',
      textOverlays: ['This app saved me'],
      musicStyle: 'trending_audio',
      replicabilityScore: 9,
    },
  },
];

const seedRemixes: RemixScriptRecord[] = [
  {
    id: 'remix-001',
    analysisId: 'ana-001',
    createdAt: daysAgo(0),
    script: {
      hook: 'I returned 6 dresses until I tried ClothME\'s body scan',
      hookVariants: [
        'Stop guessing your size — scan your body in 30 seconds',
        'POV: you finally order the right size every time',
        'This app ended my online shopping returns era',
      ],
      body: 'Show sizing struggle, demo ClothME body scan on phone, show size recommendation, try on outfit that fits.',
      cta: 'Download ClothME — link in bio',
      shotList: [
        { segment: 'hook', durationSec: 3, visual: 'Talking head, relatable frustration', overlayText: 'POV: sizing struggles' },
        { segment: 'demo', durationSec: 14, visual: 'Phone screen recording of ClothME scan', overlayText: undefined },
        { segment: 'cta', durationSec: 6, visual: 'Happy with fitting outfit', overlayText: 'Link in bio' },
      ],
      caption: 'Never guess your size again 👗📱 #clothme #fashion #sizing',
      hashtags: ['clothme', 'fashion', 'sizing', 'tryon', 'bodyscan'],
    },
  },
];

const seedAvatars: AvatarProfile[] = [
  {
    id: 'avatar-001',
    firstName: 'Alex',
    lastName: 'Rivera',
    age: 26,
    jobTitle: 'Fashion Creator',
    company: 'ClothME',
    location: 'Los Angeles, CA',
    bio: 'Relatable fashion enthusiast who struggled with online sizing until finding body scan tech.',
    heygenAvatarId: 'default_female_1',
    photoUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex',
    voiceStyle: 'casual, upbeat',
    isActive: true,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  },
  {
    id: 'avatar-002',
    firstName: 'Jordan',
    lastName: 'Kim',
    age: 29,
    jobTitle: 'Style Consultant',
    company: 'Independent',
    location: 'New York, NY',
    bio: 'Plus-size styling tips and honest try-on reviews for everyday shoppers.',
    heygenAvatarId: 'default_female_2',
    photoUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Jordan',
    voiceStyle: 'warm, conversational',
    isActive: true,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];

const seedAccounts: Array<{
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  handle: string;
  displayName?: string;
  followerCount?: number;
  isActive: boolean;
  createdAt: string;
}> = [
  { id: 'acc-001', platform: 'tiktok', handle: 'clothme', displayName: 'ClothME Official', followerCount: 12400, isActive: true, createdAt: daysAgo(10) },
  { id: 'acc-002', platform: 'instagram', handle: 'clothme.app', displayName: 'ClothME', followerCount: 8700, isActive: true, createdAt: daysAgo(10) },
];

const seedExports: Record<string, unknown>[] = [];

type EditProject = {
  id: string;
  name: string;
  remixScriptId?: string;
  status: string;
  editState: Record<string, unknown>;
  outputPath?: string;
};

type AiUgcJob = {
  id: string;
  remixScriptId: string;
  avatarProfileId?: string;
  avatarId: string;
  avatarName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputPath?: string;
  createdAt: string;
};

// ── In-memory store (persists for the browser session via module singleton) ──

let videos = [...seedVideos];
let analyses = [...seedAnalyses];
let remixes = [...seedRemixes];
let avatars = [...seedAvatars];
let accounts = [...seedAccounts];
let exports_ = [...seedExports];
let editProjects: Record<string, EditProject> = {};
let aiUgcJobs: AiUgcJob[] = [];

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function labelFor(video: { platform: string; caption?: string | null; externalUrl: string }) {
  const snippet = video.caption?.slice(0, 60) ?? video.externalUrl.slice(0, 60);
  return `[${video.platform}] ${snippet}${snippet.length >= 60 ? '…' : ''}`;
}

function enrichVideo(v: SourceVideo): SourceVideo {
  const analysis = analyses.find((a) => a.sourceVideoId === v.id && a.status === 'completed');
  const remixCount = analysis
    ? remixes.filter((r) => r.analysisId === analysis.id).length
    : 0;
  const hook = analysis
    ? (analysis.analysis as { hook?: string }).hook ?? null
    : null;

  return {
    ...v,
    label: labelFor(v),
    hook,
    remixCount,
    pipeline: {
      analyzed: !!analysis,
      remixed: remixCount > 0,
      analysisId: analysis?.id,
    },
  };
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ── Mock API ─────────────────────────────────────────────────────────

export const mockApi = {
  health: () =>
    delay({
      status: 'ok' as const,
      services: { database: 'mock', openai: true, heygen: true },
    }),

  accounts: {
    list: () => delay([...accounts]),
    create: (body: { platform: 'tiktok' | 'instagram' | 'youtube'; handle: string; displayName?: string }) => {
      const row = { id: uid('acc'), ...body, isActive: true, createdAt: new Date().toISOString() };
      accounts = [...accounts, row];
      return delay(row);
    },
    remove: (id: string) => {
      accounts = accounts.filter((a) => a.id !== id);
      return delay({ deleted: true });
    },
  },

  videos: {
    list: () => delay(videos.map(enrichVideo)),
    ingest: (body: { url: string; caption?: string }) => {
      const platform = body.url.includes('instagram')
        ? 'instagram'
        : body.url.includes('youtube') || body.url.includes('youtu.be')
          ? 'youtube'
          : 'tiktok';
      const row: SourceVideo = enrichVideo({
        id: uid('vid'),
        platform,
        externalUrl: body.url,
        caption: body.caption ?? null,
        viralScore: Math.round(Math.random() * 100) / 10,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
      videos = [row, ...videos];
      return delay(row);
    },
    get: (id: string) => {
      const v = videos.find((x) => x.id === id);
      if (!v) throw new Error('Video not found');
      return delay(enrichVideo(v));
    },
    detail: (id: string): Promise<VideoDetail> => {
      const v = videos.find((x) => x.id === id);
      if (!v) throw new Error('Video not found');
      const analysis = analyses.find((a) => a.sourceVideoId === id) ?? null;
      const videoRemixes = analysis
        ? remixes.filter((r) => r.analysisId === analysis.id)
        : [];
      return delay({
        video: enrichVideo(v),
        analysis,
        remixes: videoRemixes,
        pipeline: {
          discovered: true,
          analyzed: analysis?.status === 'completed',
          remixed: videoRemixes.length > 0,
        },
      });
    },
  },

  analysis: {
    listCompleted: (): Promise<AnalyzedVideoOption[]> => {
      const completed = analyses.filter((a) => a.status === 'completed');
      return delay(
        completed.map((a) => {
          const video = videos.find((v) => v.id === a.sourceVideoId)!;
          return {
            id: a.id,
            sourceVideoId: a.sourceVideoId,
            status: a.status,
            createdAt: a.createdAt,
            label: labelFor(video),
            hook: (a.analysis as { hook?: string }).hook ?? null,
            video: enrichVideo(video),
          };
        }),
      );
    },
    create: (sourceVideoId: string) => {
      const video = videos.find((v) => v.id === sourceVideoId);
      if (!video) throw new Error('Video not found');

      const existing = analyses.find((a) => a.sourceVideoId === sourceVideoId);
      if (existing?.status === 'completed') return delay(existing);

      const analysis: VideoAnalysisRecord = {
        id: existing?.id ?? uid('ana'),
        sourceVideoId,
        status: 'completed',
        createdAt: new Date().toISOString(),
        transcript: video.caption ?? 'Mock transcript',
        analysis: {
          format: 'Problem → Demo → CTA',
          hook: video.caption?.slice(0, 60) ?? 'I never know what size to order online',
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

      if (existing) {
        analyses = analyses.map((a) => (a.id === existing.id ? analysis : a));
      } else {
        analyses = [...analyses, analysis];
      }
      return delay(analysis);
    },
    get: (id: string) => {
      const a = analyses.find((x) => x.id === id);
      if (!a) throw new Error('Analysis not found');
      return delay(a);
    },
    getByVideo: (sourceVideoId: string) => {
      const a = analyses.find((x) => x.sourceVideoId === sourceVideoId) ?? null;
      return delay(a);
    },
  },

  scripts: {
    list: () => delay([...remixes]),
    listByAnalysis: (analysisId: string) =>
      delay(remixes.filter((r) => r.analysisId === analysisId)),
    remix: (analysisId: string) => {
      const analysis = analyses.find((a) => a.id === analysisId);
      if (!analysis) throw new Error('Analysis not found');
      const hook = (analysis.analysis as { hook?: string }).hook ?? 'Mock hook';

      const script: RemixScriptRecord = {
        id: uid('remix'),
        analysisId,
        createdAt: new Date().toISOString(),
        script: {
          hook: `I returned 6 dresses until I tried ClothME's body scan`,
          hookVariants: [
            'Stop guessing your size — scan your body in 30 seconds',
            'POV: you finally order the right size every time',
            `ClothME remix of: "${hook.slice(0, 40)}…"`,
          ],
          body: `Adapt "${hook}" for ClothME — show body scan demo and size recommendation.`,
          cta: 'Download ClothME — link in bio',
          shotList: [
            { segment: 'hook', durationSec: 3, visual: 'Talking head', overlayText: 'POV: sizing struggles' },
            { segment: 'demo', durationSec: 14, visual: 'ClothME app screen recording' },
            { segment: 'cta', durationSec: 6, visual: 'Outfit that fits perfectly' },
          ],
          caption: 'Never guess your size again 👗📱 #clothme #fashion #sizing',
          hashtags: ['clothme', 'fashion', 'sizing', 'tryon', 'bodyscan'],
        },
      };
      remixes = [...remixes, script];
      return delay(script);
    },
    get: (id: string) => {
      const s = remixes.find((x) => x.id === id);
      if (!s) throw new Error('Script not found');
      return delay(s);
    },
  },

  avatars: {
    list: () => delay([...avatars]),
    create: (body: Omit<AvatarProfile, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }) => {
      const row: AvatarProfile = {
        ...body,
        id: uid('avatar'),
        isActive: body.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      avatars = [...avatars, row];
      return delay(row);
    },
    get: (id: string) => {
      const a = avatars.find((x) => x.id === id);
      if (!a) throw new Error('Avatar not found');
      return delay(a);
    },
    update: (id: string, body: Partial<AvatarProfile>) => {
      const idx = avatars.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Avatar not found');
      avatars[idx] = { ...avatars[idx], ...body, updatedAt: new Date().toISOString() };
      return delay(avatars[idx]);
    },
    remove: (id: string) => {
      avatars = avatars.filter((a) => a.id !== id);
      return delay({ deleted: true });
    },
  },

  editor: {
    create: (body: { name: string; remixScriptId?: string; editState?: unknown }) => {
      const project: EditProject = {
        id: uid('edit'),
        name: body.name,
        remixScriptId: body.remixScriptId,
        status: 'pending',
        editState: (body.editState as Record<string, unknown>) ?? {
          trimStartSec: 0,
          trimEndSec: 30,
          textOverlays: [],
          captionStyle: 'none',
        },
      };
      editProjects[project.id] = project;
      return delay(project);
    },
    get: (id: string) => {
      const p = editProjects[id];
      if (!p) throw new Error('Edit project not found');
      return delay(p);
    },
    update: (id: string, editState: unknown) => {
      const p = editProjects[id];
      if (!p) throw new Error('Edit project not found');
      p.editState = editState as Record<string, unknown>;
      return delay(p);
    },
    render: (id: string, _file: File) => {
      const p = editProjects[id];
      if (!p) throw new Error('Edit project not found');
      p.status = 'completed';
      p.outputPath = `/mock/output/${id}.mp4`;
      return delay({ outputPath: p.outputPath, status: 'completed', downloadUrl: p.outputPath }, 800);
    },
  },

  aiUgc: {
    avatars: () =>
      delay([
        { id: 'default_female_1', name: 'Alex — Casual Creator' },
        { id: 'default_female_2', name: 'Jordan — Fashion Enthusiast' },
      ]),
    list: () => delay([...aiUgcJobs]),
    create: (body: { remixScriptId: string; avatarProfileId?: string }) => {
      const profile = body.avatarProfileId
        ? avatars.find((a) => a.id === body.avatarProfileId)
        : null;
      const job: AiUgcJob = {
        id: uid('ugc'),
        remixScriptId: body.remixScriptId,
        avatarProfileId: body.avatarProfileId,
        avatarId: profile?.heygenAvatarId ?? 'default_female_1',
        avatarName: profile ? `${profile.firstName} ${profile.lastName}` : 'Mock Avatar',
        status: 'processing',
        createdAt: new Date().toISOString(),
      };
      aiUgcJobs = [job, ...aiUgcJobs];
      setTimeout(() => {
        const idx = aiUgcJobs.findIndex((j) => j.id === job.id);
        if (idx >= 0) {
          aiUgcJobs[idx] = {
            ...aiUgcJobs[idx],
            status: 'completed',
            outputPath: `/mock/output/${job.id}.mp4`,
          };
        }
      }, 2500);
      return delay(job, 400);
    },
    get: (id: string) => {
      const job = aiUgcJobs.find((j) => j.id === id);
      if (!job) throw new Error('Job not found');
      return delay(job);
    },
  },

  exports: {
    list: () => delay([...exports_]),
    create: (body: Record<string, unknown>) => {
      const row = {
        id: uid('export'),
        createdAt: new Date().toISOString(),
        downloadUrl: body.outputPath,
        ...body,
      };
      exports_ = [row, ...exports_];
      return delay(row);
    },
  },

  activity: {
    list: () => {
      const items = [
        ...videos.slice(0, 3).map((v) => ({
          id: `act-vid-${v.id}`,
          type: 'discovered' as const,
          label: `Discovered: ${v.caption?.slice(0, 50) ?? v.platform}`,
          href: `/research/videos/${v.id}`,
          createdAt: v.createdAt,
        })),
        ...analyses.map((a) => {
          const video = videos.find((v) => v.id === a.sourceVideoId);
          return {
            id: `act-ana-${a.id}`,
            type: 'analyzed' as const,
            label: `Analyzed: ${(a.analysis as { hook?: string }).hook?.slice(0, 50) ?? video?.platform}`,
            href: `/research/analyze?videoId=${a.sourceVideoId}`,
            createdAt: a.createdAt,
          };
        }),
        ...remixes.map((r) => ({
          id: `act-remix-${r.id}`,
          type: 'remixed' as const,
          label: `Remixed: ${(r.script as { hook?: string }).hook?.slice(0, 50) ?? 'ClothME script'}`,
          href: `/research/remix?analysisId=${r.analysisId}`,
          createdAt: r.createdAt,
        })),
      ];
      return delay(
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
      );
    },
  },
};
