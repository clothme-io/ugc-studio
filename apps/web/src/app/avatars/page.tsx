'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
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
    <AppShell>
      <div className="mx-auto max-w-4xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Avatars</h1>
            <p className="mt-1 text-neutral-600">
              Create AI UGC personas with full profiles — name, job, company, bio, and more.
            </p>
          </div>
          <Link
            href="/avatars/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + New avatar
          </Link>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-neutral-500">Loading…</p>
        ) : avatars.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
            <p className="text-neutral-600">No avatars yet.</p>
            <Link href="/avatars/new" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
              Create your first avatar →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {avatars.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                    {a.firstName[0]}
                    {a.lastName[0]}
                  </div>
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
                    {a.location && (
                      <p className="text-xs text-neutral-500">{a.location}</p>
                    )}
                  </div>
                </div>
                {a.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{a.bio}</p>
                )}
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/avatars/${a.id}`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleRemove(a.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
