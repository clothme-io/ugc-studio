'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

export default function DiscoverPage() {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const video = (await api.videos.ingest({ url, caption: caption || undefined })) as Record<
        string,
        unknown
      >;
      setResult(video);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell pathname="/discover">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="mt-1 text-neutral-600">
          Paste a TikTok, Instagram Reel, or YouTube Short URL to add it to your library.
        </p>

        <form onSubmit={handleIngest} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium">Video URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@user/video/..."
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Caption (optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Adding…' : 'Add to library'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {result && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">Video added</p>
            <p className="mt-1 text-sm text-green-700">ID: {String(result.id)}</p>
            <a
              href={`/analyze?videoId=${result.id}`}
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Analyze this video →
            </a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
