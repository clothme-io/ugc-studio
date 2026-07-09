'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { api, type AvatarProfile } from '@/lib/api';

export default function AvatarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<Partial<AvatarProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.avatars
      .get(id)
      .then(setForm)
      .catch(() => setError('Avatar not found'))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field: keyof AvatarProfile, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await api.avatars.update(id, {
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age ?? undefined,
        jobTitle: form.jobTitle ?? undefined,
        company: form.company ?? undefined,
        location: form.location ?? undefined,
        bio: form.bio ?? undefined,
        heygenAvatarId: form.heygenAvatarId ?? undefined,
        photoUrl: form.photoUrl ?? undefined,
        voiceStyle: form.voiceStyle ?? undefined,
      });
      setForm(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="p-8 text-sm text-neutral-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-8">
        <Link href="/avatars" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Avatars
        </Link>
        <h1 className="mt-4 text-2xl font-bold">
          {form.firstName} {form.lastName}
        </h1>

        <form onSubmit={handleSave} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">First name</label>
              <input
                required
                value={form.firstName ?? ''}
                onChange={(e) => update('firstName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Last name</label>
              <input
                required
                value={form.lastName ?? ''}
                onChange={(e) => update('lastName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Age</label>
              <input
                type="number"
                value={form.age ?? ''}
                onChange={(e) => update('age', e.target.value ? Number(e.target.value) : '')}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                value={form.location ?? ''}
                onChange={(e) => update('location', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Job title</label>
              <input
                value={form.jobTitle ?? ''}
                onChange={(e) => update('jobTitle', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company</label>
              <input
                value={form.company ?? ''}
                onChange={(e) => update('company', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              value={form.bio ?? ''}
              onChange={(e) => update('bio', e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <p className="text-sm font-medium">AI generation</p>
            <div>
              <label className="block text-xs text-neutral-600">HeyGen avatar ID</label>
              <input
                value={form.heygenAvatarId ?? ''}
                onChange={(e) => update('heygenAvatarId', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600">Voice style</label>
              <input
                value={form.voiceStyle ?? ''}
                onChange={(e) => update('voiceStyle', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600">Photo URL</label>
              <input
                value={form.photoUrl ?? ''}
                onChange={(e) => update('photoUrl', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <Link
              href={`/ai-ugc?avatarProfileId=${id}`}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Use in AI UGC →
            </Link>
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </AppShell>
  );
}
