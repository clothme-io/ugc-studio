'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

const empty = {
  firstName: '',
  lastName: '',
  age: '',
  jobTitle: '',
  company: '',
  location: '',
  bio: '',
  heygenAvatarId: '',
  photoUrl: '',
  voiceStyle: '',
};

export default function NewAvatarPage() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const avatar = await api.avatars.create({
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age ? Number(form.age) : undefined,
        jobTitle: form.jobTitle || undefined,
        company: form.company || undefined,
        location: form.location || undefined,
        bio: form.bio || undefined,
        heygenAvatarId: form.heygenAvatarId || undefined,
        photoUrl: form.photoUrl || undefined,
        voiceStyle: form.voiceStyle || undefined,
      });
      router.push(`/avatars/${avatar.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create avatar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-8">
        <Link href="/avatars" className="text-sm text-neutral-500 hover:text-neutral-800">
          ← Avatars
        </Link>
        <h1 className="mt-4 text-2xl font-bold">New avatar</h1>
        <p className="mt-1 text-neutral-600">
          Build a complete persona for AI UGC — used when generating talking-head videos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">First name *</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Last name *</label>
              <input
                required
                value={form.lastName}
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
                min={18}
                max={99}
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Los Angeles, CA"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Job title</label>
              <input
                value={form.jobTitle}
                onChange={(e) => update('jobTitle', e.target.value)}
                placeholder="Fashion creator"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company</label>
              <input
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                placeholder="ClothME"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={3}
              placeholder="Relatable fashion enthusiast who struggles with online sizing…"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-800">AI generation settings</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600">HeyGen avatar ID</label>
                <input
                  value={form.heygenAvatarId}
                  onChange={(e) => update('heygenAvatarId', e.target.value)}
                  placeholder="default_female_1"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">Voice style</label>
                <input
                  value={form.voiceStyle}
                  onChange={(e) => update('voiceStyle', e.target.value)}
                  placeholder="casual, upbeat"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-600">Photo URL</label>
              <input
                type="url"
                value={form.photoUrl}
                onChange={(e) => update('photoUrl', e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create avatar'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </AppShell>
  );
}
