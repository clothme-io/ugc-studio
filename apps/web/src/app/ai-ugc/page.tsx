'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { api, type AvatarProfile } from '@/lib/api';

function AiUgcContent() {
  const params = useSearchParams();
  const initialScriptId = params.get('scriptId') ?? '';
  const initialAvatarProfileId = params.get('avatarProfileId') ?? '';

  const [scriptId, setScriptId] = useState(initialScriptId);
  const [profiles, setProfiles] = useState<AvatarProfile[]>([]);
  const [avatarProfileId, setAvatarProfileId] = useState(initialAvatarProfileId);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.avatars.list().then((list) => {
      setProfiles(list);
      if (initialAvatarProfileId) {
        setAvatarProfileId(initialAvatarProfileId);
      } else if (list[0]) {
        setAvatarProfileId(list[0].id);
      }
    });
  }, [initialAvatarProfileId]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = (await api.aiUgc.create({
        remixScriptId: scriptId,
        avatarProfileId: avatarProfileId || undefined,
      })) as Record<string, unknown>;
      setJob(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  const selected = profiles.find((p) => p.id === avatarProfileId);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">AI UGC</h1>
      <p className="mt-1 text-neutral-600">
        Generate talking-head UGC using a ClothME script and an avatar profile.
      </p>

      <form onSubmit={handleGenerate} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Remix script ID</label>
          <input
            type="text"
            required
            value={scriptId}
            onChange={(e) => setScriptId(e.target.value)}
            placeholder="From Remix step"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar profile</label>
          {profiles.length === 0 ? (
            <p className="mt-1 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              No avatars yet.{' '}
              <Link href="/avatars/new" className="font-medium text-brand-600 hover:underline">
                Create one →
              </Link>
            </p>
          ) : (
            <select
              value={avatarProfileId}
              onChange={(e) => setAvatarProfileId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                  {p.jobTitle ? ` — ${p.jobTitle}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {selected && (
          <div className="rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            <p className="font-medium text-neutral-900">
              {selected.firstName} {selected.lastName}
              {selected.age ? `, ${selected.age}` : ''}
            </p>
            {(selected.jobTitle || selected.company) && (
              <p>
                {[selected.jobTitle, selected.company].filter(Boolean).join(' @ ')}
              </p>
            )}
            {selected.bio && <p className="mt-1 line-clamp-2">{selected.bio}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !avatarProfileId}
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
    <AppShell>
      <Suspense>
        <AiUgcContent />
      </Suspense>
    </AppShell>
  );
}
