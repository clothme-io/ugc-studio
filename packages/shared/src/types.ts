export type Platform = 'tiktok' | 'instagram' | 'youtube';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoSegment {
  segment: string;
  start: number;
  end: number;
  notes?: string;
}

export interface VideoAnalysis {
  format: string;
  hook: string;
  hookType: string;
  durationSec: number;
  structure: VideoSegment[];
  cta: string;
  textOverlays: string[];
  musicStyle: string;
  replicabilityScore: number;
  transcript?: string;
}

export interface RemixScript {
  hook: string;
  hookVariants: string[];
  body: string;
  cta: string;
  shotList: Array<{
    segment: string;
    durationSec: number;
    visual: string;
    overlayText?: string;
  }>;
  caption: string;
  hashtags: string[];
}

export interface TextOverlay {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface SourceVideo {
  id: string;
  platform: Platform;
  externalUrl: string;
  accountHandle?: string | null;
  caption?: string | null;
  viewCount?: number | null;
  likeCount?: number | null;
  viralScore?: number | null;
  status: string;
  createdAt: string;
  label?: string;
  pipeline?: {
    analyzed: boolean;
    remixed: boolean;
    analysisId?: string;
  };
  hook?: string | null;
  remixCount?: number;
}

export interface VideoAnalysisRecord {
  id: string;
  sourceVideoId: string;
  analysis: Record<string, unknown>;
  transcript?: string | null;
  status: string;
  createdAt: string;
}

export interface AnalyzedVideoOption {
  id: string;
  sourceVideoId: string;
  status: string;
  label: string;
  hook?: string | null;
  createdAt: string;
  video: SourceVideo;
}

export interface RemixScriptRecord {
  id: string;
  analysisId: string;
  script: Record<string, unknown>;
  createdAt: string;
}

export interface VideoDetail {
  video: SourceVideo;
  analysis: VideoAnalysisRecord | null;
  remixes: RemixScriptRecord[];
  pipeline: {
    discovered: boolean;
    analyzed: boolean;
    remixed: boolean;
  };
}

export interface AvatarProfile {
  id: string;
  firstName: string;
  lastName: string;
  age?: number | null;
  jobTitle?: string | null;
  company?: string | null;
  location?: string | null;
  bio?: string | null;
  heygenAvatarId?: string | null;
  photoUrl?: string | null;
  voiceStyle?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
