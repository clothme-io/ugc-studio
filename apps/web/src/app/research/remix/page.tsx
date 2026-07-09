'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, type AnalyzedVideoOption, type RemixScriptRecord } from '@/lib/api';

function RemixContent() {
  const params = useSearchParams();
  const initialId = params.get('analysisId') ?? '';

  const [analyzed, setAnalyzed] = useState<AnalyzedVideoOption[]>([]);
  const [analysisId, setAnalysisId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<RemixScriptRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.analysis.listCompleted().then((list) => {
      setAnalyzed(list);
      if (initialId) setAnalysisId(initialId);
    });
  }, [initialId]);

  async function handleRemix(e: React.FormEvent) {
    e.preventDefault();
    if (!analysisId) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.scripts.remix(analysisId);
      setScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remix failed');
    } finally {
      setLoading(false);
    }
  }

  const scriptData = script?.script as Record<string, unknown> | undefined;
  const hookVariants = (scriptData?.hookVariants as string[]) ?? [];
  const selected = analyzed.find((a) => a.id === analysisId);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Remix</h1>
      <p className="mt-1 text-neutral-600">
        Pick an analyzed video to generate a ClothME script that preserves the viral format.
      </p>

      <form onSubmit={handleRemix} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Analyzed video</label>
          {analyzed.length === 0 ? (
            <p className="mt-1 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              No analyzed videos yet.{' '}
              <Link href="/research/analyze" className="font-medium text-brand-600 hover:underline">
                Analyze one first →
              </Link>
            </p>
          ) : (
            <select
              value={analysisId}
              onChange={(e) => setAnalysisId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select an analyzed video…</option>
              {analyzed.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                  {a.hook ? ` — "${a.hook.slice(0, 40)}…"` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {selected && (
          <p className="text-xs text-neutral-500">
            Source:{' '}
            <Link
              href={`/research/videos/${selected.sourceVideoId}`}
              className="text-brand-600 hover:underline"
            >
              view video detail
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !analysisId}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Remixing…' : 'Remix for ClothME'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {scriptData && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">Hook</h2>
            <p className="mt-2 text-lg">{String(scriptData.hook)}</p>
            {hookVariants.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-neutral-500">A/B variants</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {hookVariants.map((v) => (
                    <li key={v} className="rounded bg-neutral-50 px-3 py-2">
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">Caption</h2>
            <p className="mt-2 text-sm">{String(scriptData.caption)}</p>
          </div>

          {script?.id ? (
            <div className="flex gap-3">
              <Link
                href={`/ai-ugc?scriptId=${script.id}`}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Generate AI UGC →
              </Link>
              <Link
                href={`/editor?scriptId=${script.id}`}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                Open Editor →
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function RemixPage() {
  return (
    <Suspense>
      <RemixContent />
    </Suspense>
  );
}
