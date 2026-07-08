'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

function AiUgcContent() {
  const params = useSearchParams();
  const initialScriptId = params.get('scriptId') ?? '';
  const [scriptId, setScriptId] = useState(initialScriptId);
  const [avatars, setAvatars] = useState<{ id: string; name: string }[]>([]);
  const [avatarId, setAvatarId] = useState('');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.aiUgc.avatars().then((list) => {
      setAvatars(list);
      if (list[0]) setAvatarId(list[0].id);
    });
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = (await api.aiUgc.create({
        remixScriptId: scriptId,
        avatarId,
        avatarName: avatars.find((a) => a.id === avatarId)?.name,
      })) as Record<string, unknown>;
      setJob(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">AI UGC</h1>
      <p className="mt-1 text-neutral-600">
        Generate talking-head UGC videos with AI avatars using your ClothME script.
      </p>

      <form onSubmit={handleGenerate} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Remix script ID</label>
          <input
            type="text"
            required
            value={scriptId}
            onChange={(e) => setScriptId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar</label>
          <select
            value={avatarId}
            onChange={(e) => setAvatarId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {avatars.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate AI UGC'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {job && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Job created</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">Job ID</dt>
              <dd className="font-mono">{String(job.id)}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-medium capitalize">{String(job.status)}</dd>
            </div>
            {job.outputPath ? (
              <div>
                <dt className="text-neutral-500">Output</dt>
                <dd>{String(job.outputPath)}</dd>
              </div>
            ) : null}
          </dl>
          <a
            href={`/export?aiUgcJobId=${job.id}&outputPath=${encodeURIComponent(String(job.outputPath ?? ''))}`}
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            Export video →
          </a>
        </div>
      )}
    </div>
  );
}

export default function AiUgcPage() {
  return (
    <AppShell pathname="/ai-ugc">
      <Suspense>
        <AiUgcContent />
      </Suspense>
    </AppShell>
  );
}
