'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageContent } from '@/components/PageContent';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';

export default function DiscoverPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      toast('Video added to library');
      router.push(`/research/videos/${video.id}?added=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ingest');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContent maxWidth="2xl">
      <PageHeader
        title="Discover"
        description="Paste a TikTok, Instagram Reel, or YouTube Short URL. It is saved to your Library and becomes available in Analyze and Remix."
      />

      <Card className="bg-neutral-50">
        <p className="font-medium text-neutral-900">What happens after you add a link?</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-neutral-700">
          <li>Video metadata is saved to the <Link href="/research/library" className="text-brand-600 hover:underline">Library</Link></li>
          <li>You land on the video detail page to review it</li>
          <li>From there (or Analyze), run AI structure breakdown</li>
          <li>Then Remix into a ClothME script for production</li>
        </ol>
      </Card>

      <form onSubmit={handleIngest} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Video URL</label>
          <Input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/..."
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Caption (optional)</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="Paste the original caption if you have it — helps analysis"
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add to library'}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </PageContent>
  );
}
