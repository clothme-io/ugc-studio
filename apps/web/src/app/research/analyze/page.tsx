'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VideoSelect } from '@/components/VideoSelect';
import { api, type SourceVideo, type VideoAnalysisRecord } from '@/lib/api';

function AnalyzeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialId = params.get('videoId') ?? '';

  const [videos, setVideos] = useState<SourceVideo[]>([]);
  const [videoId, setVideoId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysisRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.videos.list().then((list) => {
      setVideos(list);
      if (initialId) setVideoId(initialId);
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

  const analysisData = analysis?.analysis as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Analyze</h1>
      <p className="mt-1 text-neutral-600">
        Pick any video from your library to deconstruct hook, structure, and CTA.
      </p>

      <form onSubmit={handleAnalyze} className="mt-8 space-y-4">
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
          <button
            type="submit"
            disabled={loading || !videoId}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : analysis ? 'Re-run analysis' : 'Analyze'}
          </button>
          {videoId && (
            <button
              type="button"
              onClick={() => router.push(`/research/videos/${videoId}`)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              View detail
            </button>
          )}
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {analysisData && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">Structure</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-neutral-500">Format</dt>
                <dd className="font-medium">{String(analysisData.format)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Hook type</dt>
                <dd className="font-medium">{String(analysisData.hookType)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-neutral-500">Hook</dt>
                <dd className="font-medium">&ldquo;{String(analysisData.hook)}&rdquo;</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Replicability</dt>
                <dd className="font-medium">{String(analysisData.replicabilityScore)}/10</dd>
              </div>
              <div>
                <dt className="text-neutral-500">CTA</dt>
                <dd className="font-medium">{String(analysisData.cta)}</dd>
              </div>
            </dl>
          </div>

          {analysis?.id ? (
            <Link
              href={`/research/remix?analysisId=${analysis.id}`}
              className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Remix for ClothME →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzeContent />
    </Suspense>
  );
}
