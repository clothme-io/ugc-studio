'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

function RemixContent() {
  const params = useSearchParams();
  const initialId = params.get('analysisId') ?? '';
  const [analysisId, setAnalysisId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleRemix(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = (await api.scripts.remix(analysisId)) as Record<string, unknown>;
      setScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remix failed');
    } finally {
      setLoading(false);
    }
  }

  const scriptData = script?.script as Record<string, unknown> | undefined;
  const hookVariants = (scriptData?.hookVariants as string[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Remix</h1>
      <p className="mt-1 text-neutral-600">
        Generate a ClothME script that preserves the viral format.
      </p>

      <form onSubmit={handleRemix} className="mt-8 flex gap-3">
        <input
          type="text"
          required
          value={analysisId}
          onChange={(e) => setAnalysisId(e.target.value)}
          placeholder="Analysis ID"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
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
              <a
                href={`/ai-ugc?scriptId=${script.id}`}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Generate AI UGC →
              </a>
              <a
                href={`/editor?scriptId=${script.id}`}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                Open Editor →
              </a>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function RemixPage() {
  return (
    <AppShell pathname="/remix">
      <Suspense>
        <RemixContent />
      </Suspense>
    </AppShell>
  );
}
