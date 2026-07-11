'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button, Card, Select, Skeleton } from '@/components/ui';
import { api, type AvatarProfile, type RemixScriptRecord } from '@/lib/api';
import { uuidFromQuery } from '@/lib/uuid';

type Job = {
  id: string;
  status: string;
  outputPath?: string;
  avatarName?: string;
  remixScriptId: string;
};

function AiUgcContent() {
  const params = useSearchParams();
  const initialScriptId = uuidFromQuery(params.get('scriptId'));
  const initialAvatarProfileId = uuidFromQuery(params.get('avatarProfileId'));

  const [scripts, setScripts] = useState<RemixScriptRecord[]>([]);
  const [scriptId, setScriptId] = useState(initialScriptId);
  const [profiles, setProfiles] = useState<AvatarProfile[]>([]);
  const [avatarProfileId, setAvatarProfileId] = useState(initialAvatarProfileId);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.scripts.list(), api.avatars.list()]).then(([scriptList, avatarList]) => {
      setScripts(scriptList);
      setProfiles(avatarList);
      if (initialScriptId) setScriptId(initialScriptId);
      else if (scriptList[0]) setScriptId(scriptList[0].id);
      if (initialAvatarProfileId) setAvatarProfileId(initialAvatarProfileId);
      else if (avatarList[0]) setAvatarProfileId(avatarList[0].id);
      setPageLoading(false);
    });
  }, [initialScriptId, initialAvatarProfileId]);

  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') return;
    const interval = setInterval(() => {
      api.aiUgc.get(job.id).then((updated) => setJob(updated as Job));
    }, 1000);
    return () => clearInterval(interval);
  }, [job]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!scriptId) return;
    setLoading(true);
    setError('');
    setJob(null);
    try {
      const result = (await api.aiUgc.create({
        remixScriptId: scriptId,
        avatarProfileId: avatarProfileId || undefined,
      })) as Job;
      setJob(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  const selected = profiles.find((p) => p.id === avatarProfileId);
  const selectedScript = scripts.find((s) => s.id === scriptId);

  return (
    <PageLayout>
      <PageHeader
        title="AI UGC"
        description="Generate talking-head UGC using a ClothME script and an avatar profile."
      />

      {pageLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : scripts.length === 0 ? (
        <EmptyState
          message="No remix scripts yet. Create one in Research → Remix first."
          actionLabel="Go to Remix"
          actionHref="/research/remix"
        />
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Remix script</label>
            <Select value={scriptId} onChange={(e) => setScriptId(e.target.value)} className="mt-1">
              {scripts.map((s) => (
                <option key={s.id} value={s.id}>
                  {(s.script as { hook?: string }).hook?.slice(0, 80) ?? s.id}
                </option>
              ))}
            </Select>
          </div>

          {selectedScript && (
            <Card className="!p-4">
              <p className="text-xs font-medium text-neutral-500">Script preview</p>
              <p className="mt-1 text-sm">{(selectedScript.script as { body?: string }).body}</p>
            </Card>
          )}

          <div>
            <label className="block text-sm font-medium">Avatar profile</label>
            {profiles.length === 0 ? (
              <p className="mt-1 text-sm text-neutral-600">
                No avatars yet.{' '}
                <Link href="/avatars/new" className="font-medium text-brand-600 hover:underline">
                  Create one →
                </Link>
              </p>
            ) : (
              <Select value={avatarProfileId} onChange={(e) => setAvatarProfileId(e.target.value)} className="mt-1">
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                    {p.jobTitle ? ` — ${p.jobTitle}` : ''}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {selected && (
            <Card className="!p-4">
              <div className="flex items-start gap-3">
                {selected.photoUrl ? (
                  <img src={selected.photoUrl} alt="" className="h-14 w-14 rounded-full bg-neutral-100 object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                    {selected.firstName[0]}{selected.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {selected.firstName} {selected.lastName}
                    {selected.age ? `, ${selected.age}` : ''}
                  </p>
                  {(selected.jobTitle || selected.company) && (
                    <p className="text-sm text-neutral-600">
                      {[selected.jobTitle, selected.company].filter(Boolean).join(' @ ')}
                    </p>
                  )}
                  {selected.bio && <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{selected.bio}</p>}
                </div>
              </div>
            </Card>
          )}

          <Button type="submit" disabled={loading || !scriptId || !avatarProfileId}>
            {loading ? 'Starting…' : 'Generate AI UGC'}
          </Button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {job && (
        <Card className="mt-8">
          <h2 className="font-semibold">Generation job</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">Job ID</dt>
              <dd className="font-mono">{job.id}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Status</dt>
              <dd className="font-medium capitalize">
                {job.status}
                {job.status === 'processing' && (
                  <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                )}
              </dd>
            </div>
            {job.avatarName && (
              <div>
                <dt className="text-neutral-500">Avatar</dt>
                <dd>{job.avatarName}</dd>
              </div>
            )}
          </dl>

          {job.status === 'completed' && job.outputPath && (
            <div className="mt-4 space-y-3">
              <div className="flex aspect-[9/16] max-w-[200px] items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-600 text-sm text-white/70">
                AI UGC preview
              </div>
              <Link
                href={`/export?aiUgcJobId=${job.id}&outputPath=${encodeURIComponent(job.outputPath)}&scriptId=${scriptId}`}
              >
                <Button size="sm">Export video →</Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </PageLayout>
  );
}

export default function AiUgcPage() {
  return (
    <Suspense>
      <AiUgcContent />
    </Suspense>
  );
}
