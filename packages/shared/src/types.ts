export type Platform = 'tiktok' | 'instagram' | 'youtube';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AiUgcStatus = JobStatus;

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

export interface EditProject {
  id: string;
  name: string;
  sourceVideoUrl?: string;
  trimStartSec: number;
  trimEndSec: number;
  textOverlays: TextOverlay[];
  captionStyle: 'none' | 'bottom' | 'tiktok';
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  displayName?: string;
  followerCount?: number;
  isActive: boolean;
}

export interface SourceVideo {
  id: string;
  platform: Platform;
  externalUrl: string;
  accountHandle?: string;
  caption?: string;
  viewCount?: number;
  likeCount?: number;
  viralScore?: number;
  thumbnailUrl?: string;
  storagePath?: string;
  status: JobStatus;
}
