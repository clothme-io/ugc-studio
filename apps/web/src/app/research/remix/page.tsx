'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScriptPanel } from '@/components/ScriptPanel';
import { PageContent } from '@/components/PageContent';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button, Select, Skeleton } from '@/components/ui';
import { api, type AnalyzedVideoOption, type RemixScriptRecord } from '@/lib/api';
import { uuidFromQuery } from '@/lib/uuid';

function RemixContent() {
  const params = useSearchParams();
  const initialId = uuidFromQuery(params.get('analysisId'));

  const [analyzed, setAnalyzed] = useState<AnalyzedVideoOption[]>([]);
  const [analysisId, setAnalysisId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [script, setScript] = useState<RemixScriptRecord | null>(null);
  const [existingScripts, setExistingScripts] = useState<RemixScriptRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.analysis.listCompleted().then((list) => {
      setAnalyzed(list);
      if (initialId) setAnalysisId(initialId);
      setPageLoading(false);
    });
  }, [initialId]);

  useEffect(() => {
    if (!analysisId) {
      setExistingScripts([]);
      setScript(null);
      return;
    }
    api.scripts.listByAnalysis(analysisId).then((list) => {
      setExistingScripts(list);
      if (list[0]) setScript(list[0]);
    });
  }, [analysisId]);

  async function handleRemix(e: React.FormEvent) {
    e.preventDefault();
    if (!analysisId) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.scripts.remix(analysisId);
      setScript(result);
      setExistingScripts((prev) => [result, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remix failed');
    } finally {
      setLoading(false);
    }
  }

  const selected = analyzed.find((a) => a.id === analysisId);

  return (
    <PageContent>
      <PageHeader
        title="Remix"
        description="Pick an analyzed video to generate a ClothME script that preserves the viral format."
      />

      {pageLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : analyzed.length === 0 ? (
        <EmptyState
          message="No analyzed videos yet. Run analysis on a discovered video first."
          actionLabel="Go to Analyze"
          actionHref="/research/analyze"
        />
      ) : (
        <form onSubmit={handleRemix} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Analyzed video</label>
            <Select
              value={analysisId}
              onChange={(e) => setAnalysisId(e.target.value)}
              className="mt-1"
            >
              <option value="">Select an analyzed video…</option>
              {analyzed.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                  {a.hook ? ` — "${a.hook.slice(0, 40)}…"` : ''}
                </option>
              ))}
            </Select>
          </div>

          {selected && (
            <p className="text-xs text-neutral-500">
              Source:{' '}
              <Link href={`/research/videos/${selected.sourceVideoId}`} className="text-brand-600 hover:underline">
                view video detail
              </Link>
            </p>
          )}

          {existingScripts.length > 0 && (
            <div>
              <label className="block text-sm font-medium">Existing scripts</label>
              <Select
                value={script?.id ?? ''}
                onChange={(e) => {
                  const found = existingScripts.find((s) => s.id === e.target.value);
                  if (found) setScript(found);
                }}
                className="mt-1"
              >
                {existingScripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {(s.script as { hook?: string }).hook?.slice(0, 60) ?? s.id}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Button type="submit" disabled={loading || !analysisId}>
            {loading ? 'Remixing…' : 'Generate new remix'}
          </Button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {script && (
        <div className="mt-8 space-y-4">
          <ScriptPanel script={script} />
          {script.id && (
            <div className="flex gap-3">
              <Link href={`/ai-ugc?scriptId=${script.id}`}>
                <Button>Generate AI UGC →</Button>
              </Link>
              <Link href={`/editor?scriptId=${script.id}`}>
                <Button variant="secondary">Open Editor →</Button>
              </Link>
              <Link href={`/export?scriptId=${script.id}`}>
                <Button variant="secondary">Export →</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </PageContent>
  );
}

export default function RemixPage() {
  return (
    <Suspense>
      <RemixContent />
    </Suspense>
  );
}
