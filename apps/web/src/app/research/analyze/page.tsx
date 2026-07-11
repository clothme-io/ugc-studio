'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { PageContent } from '@/components/PageContent';
import { PageHeader } from '@/components/PageHeader';
import { VideoSelect } from '@/components/VideoSelect';
import { Button, Skeleton } from '@/components/ui';
import { api, type SourceVideo, type VideoAnalysisRecord } from '@/lib/api';
import { uuidFromQuery } from '@/lib/uuid';

function AnalyzeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialId = uuidFromQuery(params.get('videoId'));

  const [videos, setVideos] = useState<SourceVideo[]>([]);
  const [videoId, setVideoId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [analysis, setAnalysis] = useState<VideoAnalysisRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.videos.list().then((list) => {
      setVideos(list);
      if (initialId) setVideoId(initialId);
      setPageLoading(false);
    });
  }, [initialId]);

  useEffect(() => {
    if (!videoId) {
      setAnalysis(null);
      return;
    }
    api.analysis.getByVideo(videoId).then((existing) => {
      if (existing && typeof existing === 'object' && 'status' in existing) {
        setAnalysis(existing as VideoAnalysisRecord);
      } else {
        setAnalysis(null);
      }
    });
  }, [videoId]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!videoId) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.analysis.create(videoId);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContent>
      <PageHeader
        title="Analyze"
        description="Pick any video from your library to deconstruct hook, structure, and CTA."
      />

      {pageLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Video from library</label>
            <div className="mt-1">
              <VideoSelect
                videos={videos}
                value={videoId}
                onChange={setVideoId}
                placeholder="Select a discovered video…"
                emptyMessage="No videos in library yet. Add one in Discover."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !videoId}>
              {loading ? 'Analyzing…' : analysis ? 'Re-run analysis' : 'Analyze'}
            </Button>
            {videoId && (
              <Button type="button" variant="secondary" onClick={() => router.push(`/research/videos/${videoId}`)}>
                View detail
              </Button>
            )}
          </div>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {analysis?.analysis && (
        <div className="mt-8 space-y-4">
          <AnalysisPanel analysis={analysis} />
          {analysis.id && (
            <Link href={`/research/remix?analysisId=${analysis.id}`}>
              <Button>Remix for ClothME →</Button>
            </Link>
          )}
        </div>
      )}
    </PageContent>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeContent />
    </Suspense>
  );
}
