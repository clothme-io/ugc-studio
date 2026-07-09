'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { ScriptPanel } from '@/components/ScriptPanel';
import { PageContent } from '@/components/PageContent';
import { PipelineStatus } from '@/components/PipelineStatus';
import { VideoThumbnail } from '@/components/VideoThumbnail';
import { Button, Card, Skeleton } from '@/components/ui';
import { api, type VideoDetail } from '@/lib/api';

function VideoDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const justAdded = searchParams.get('added') === '1';

  const [detail, setDetail] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.videos.detail(id);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setError('');
    try {
      await api.analysis.create(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <PageContent>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-48 w-full" />
      </PageContent>
    );
  }

  if (!detail) {
    return <PageContent><p className="text-sm text-red-600">{error || 'Video not found'}</p></PageContent>;
  }

  const { video, analysis, remixes, pipeline } = detail;

  return (
    <PageContent>
      {justAdded && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Video added to your library. Review details below, then analyze or remix.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <VideoThumbnail platform={video.platform} large />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 capitalize">
              {video.platform}
            </p>
            <h1 className="mt-1 text-2xl font-bold">Video detail</h1>
            <div className="mt-2">
              <PipelineStatus discovered analyzed={pipeline.analyzed} remixed={pipeline.remixed} />
            </div>
          </div>
        </div>
        <Link href="/research/library" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Library
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        <Card>
          <h2 className="font-semibold">Source</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">URL</dt>
              <dd>
                <a href={video.externalUrl} target="_blank" rel="noreferrer" className="break-all text-brand-600 hover:underline">
                  {video.externalUrl}
                </a>
              </dd>
            </div>
            {video.caption && (
              <div>
                <dt className="text-neutral-500">Caption</dt>
                <dd>{video.caption}</dd>
              </div>
            )}
            {video.viralScore != null && (
              <div>
                <dt className="text-neutral-500">Viral score</dt>
                <dd className="font-medium">{video.viralScore.toFixed(1)} / 10</dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-500">Added</dt>
              <dd>{new Date(video.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Analysis</h2>
            {!pipeline.analyzed && (
              <Button size="sm" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? 'Analyzing…' : 'Run analysis'}
              </Button>
            )}
          </div>

          {analysis ? (
            <div className="mt-4">
              <AnalysisPanel analysis={analysis} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">Not analyzed yet.</p>
          )}

          {analysis?.id && (
            <Link href={`/research/remix?analysisId=${analysis.id}`} className="mt-4 inline-block">
              <Button size="sm" variant="secondary">Remix for ClothME →</Button>
            </Link>
          )}
        </Card>

        {remixes.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Remix scripts ({remixes.length})</h2>
            {remixes.map((r) => (
              <div key={r.id}>
                <ScriptPanel script={r} />
                <div className="mt-3 flex gap-3">
                  <Link href={`/ai-ugc?scriptId=${r.id}`}>
                    <Button size="sm">AI UGC</Button>
                  </Link>
                  <Link href={`/editor?scriptId=${r.id}`}>
                    <Button size="sm" variant="secondary">Editor</Button>
                  </Link>
                  <Link href={`/export?scriptId=${r.id}`}>
                    <Button size="sm" variant="secondary">Export</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </PageContent>
  );
}

export default function VideoDetailPage() {
  return (
    <Suspense>
      <VideoDetailContent />
    </Suspense>
  );
}
