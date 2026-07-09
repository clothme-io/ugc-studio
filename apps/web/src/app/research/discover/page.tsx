'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function DiscoverPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const video = await api.videos.ingest({ url, caption: caption || undefined });
      setUrl('');
      setCaption('');
      router.push(`/research/videos/${video.id}?added=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Discover</h1>
      <p className="mt-1 text-neutral-600">
        Paste a TikTok, Instagram Reel, or YouTube Short URL. It is saved to your{' '}
        <a href="/research/library" className="font-medium text-brand-600 hover:underline">
          Library
        </a>{' '}
        and becomes available in Analyze and Remix dropdowns.
      </p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">What happens after you add a link?</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Video metadata is saved to the Library</li>
          <li>You land on the video detail page to review it</li>
          <li>From there (or Analyze), run AI structure breakdown</li>
          <li>Then Remix into a ClothME script for production</li>
        </ol>
      </div>

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
            placeholder="Paste the original caption if you have it — helps analysis"
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
    </div>
  );
}
