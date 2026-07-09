'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button, Skeleton } from '@/components/ui';
import { api, type AvatarProfile } from '@/lib/api';

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<AvatarProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.avatars
      .list()
      .then(setAvatars)
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(id: string) {
    if (!confirm('Delete this avatar profile?')) return;
    await api.avatars.remove(id);
    setAvatars((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <PageLayout maxWidth="4xl">
      <PageHeader
        title="Avatars"
        description="Create AI UGC personas with full profiles — name, job, company, bio, and more."
        action={
          <Link href="/avatars/new">
            <Button>+ New avatar</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : avatars.length === 0 ? (
        <EmptyState
          message="No avatars yet."
          actionLabel="Create your first avatar"
          actionHref="/avatars/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {avatars.map((a) => (
            <div key={a.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start gap-3">
                {a.photoUrl ? (
                  <img
                    src={a.photoUrl}
                    alt={`${a.firstName} ${a.lastName}`}
                    className="h-14 w-14 shrink-0 rounded-full bg-neutral-100 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                    {a.firstName[0]}
                    {a.lastName[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {a.firstName} {a.lastName}
                    {a.age ? `, ${a.age}` : ''}
                  </p>
                  {(a.jobTitle || a.company) && (
                    <p className="text-sm text-neutral-600">
                      {[a.jobTitle, a.company].filter(Boolean).join(' @ ')}
                    </p>
                  )}
                  {a.location && <p className="text-xs text-neutral-500">{a.location}</p>}
                </div>
              </div>
              {a.bio && <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{a.bio}</p>}
              <div className="mt-4 flex gap-3">
                <Link href={`/avatars/${a.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                  Edit
                </Link>
                <Link href={`/ai-ugc?avatarProfileId=${a.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                  Use in AI UGC
                </Link>
                <button onClick={() => handleRemove(a.id)} className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
