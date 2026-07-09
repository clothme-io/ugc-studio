'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
    return <p className="p-8 text-sm text-neutral-500">Loading…</p>;
  }

  if (!detail) {
    return <p className="p-8 text-sm text-red-600">{error || 'Video not found'}</p>;
  }

  const { video, analysis, remixes, pipeline } = detail;
  const analysisData = analysis?.analysis as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-3xl p-8">
      {justAdded && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Video added to your library. Review details below, then analyze or remix.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 capitalize">
            {video.platform}
          </p>
          <h1 className="mt-1 text-2xl font-bold">Video detail</h1>
        </div>
        <Link href="/research/library" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Library
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        {(['discovered', 'analyzed', 'remixed'] as const).map((step) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              pipeline[step]
                ? 'bg-green-100 text-green-800'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {step}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Source</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">URL</dt>
              <dd>
                <a
                  href={video.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-brand-600 hover:underline"
                >
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
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Analysis</h2>
            {!pipeline.analyzed && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {analyzing ? 'Analyzing…' : 'Run analysis'}
              </button>
            )}
          </div>

          {analysisData ? (
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
          ) : (
            <p className="mt-3 text-sm text-neutral-500">Not analyzed yet.</p>
          )}

          {analysis?.id && !pipeline.remixed && (
            <Link
              href={`/research/remix?analysisId=${analysis.id}`}
              className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Remix for ClothME →
            </Link>
          )}
        </div>

        {remixes.length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">Remix scripts ({remixes.length})</h2>
            <ul className="mt-3 space-y-2">
              {remixes.map((r) => {
                const script = r.script as { hook?: string; caption?: string };
                return (
                  <li key={r.id} className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                    <p className="font-medium">{script.hook}</p>
                    <div className="mt-2 flex gap-3">
                      <Link href={`/ai-ugc?scriptId=${r.id}`} className="text-brand-600 hover:underline">
                        AI UGC
                      </Link>
                      <Link href={`/editor?scriptId=${r.id}`} className="text-brand-600 hover:underline">
                        Editor
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function VideoDetailPage() {
  return (
    <Suspense>
      <VideoDetailContent />
    </Suspense>
  );
}
