'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

function AnalyzeContent() {
  const params = useSearchParams();
  const initialId = params.get('videoId') ?? '';
  const [videoId, setVideoId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = (await api.analysis.create(videoId)) as Record<string, unknown>;
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  const analysisData = analysis?.analysis as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Analyze</h1>
      <p className="mt-1 text-neutral-600">
        Deconstruct why a video works — hook, structure, CTA, and replicability score.
      </p>

      <form onSubmit={handleAnalyze} className="mt-8 flex gap-3">
        <input
          type="text"
          required
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="Source video ID (from Discover)"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
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
            <a
              href={`/remix?analysisId=${analysis.id}`}
              className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Remix for ClothME →
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <AppShell pathname="/analyze">
      <Suspense>
        <AnalyzeContent />
      </Suspense>
    </AppShell>
  );
}
