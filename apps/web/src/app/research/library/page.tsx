'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { api, type SourceVideo } from '@/lib/api';

type Filter = 'all' | 'discovered' | 'analyzed' | 'remixed';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'discovered', label: 'Discovered' },
  { id: 'analyzed', label: 'Analyzed' },
  { id: 'remixed', label: 'Remixed' },
];

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        active
          ? 'bg-green-100 text-green-800'
          : 'bg-neutral-100 text-neutral-400',
      )}
    >
      {label}
    </span>
  );
}

export default function LibraryPage() {
  const [videos, setVideos] = useState<SourceVideo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.videos
      .list()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'discovered':
        return videos.filter((v) => !v.pipeline?.analyzed);
      case 'analyzed':
        return videos.filter((v) => v.pipeline?.analyzed);
      case 'remixed':
        return videos.filter((v) => v.pipeline?.remixed);
      default:
        return videos;
    }
  }, [videos, filter]);

  const counts = useMemo(
    () => ({
      all: videos.length,
      discovered: videos.filter((v) => !v.pipeline?.analyzed).length,
      analyzed: videos.filter((v) => v.pipeline?.analyzed).length,
      remixed: videos.filter((v) => v.pipeline?.remixed).length,
    }),
    [videos],
  );

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="mt-1 text-neutral-600">
            All your discovered videos with pipeline status. Click any row for full analysis details.
          </p>
        </div>
        <Link
          href="/research/discover"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Discover
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              filter === id
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {label}
            <span className="ml-1.5 opacity-70">({counts[id]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
          <p className="text-neutral-600">
            {filter === 'all' ? 'No videos yet.' : `No ${filter} videos.`}
          </p>
          {filter === 'all' ? (
            <Link
              href="/research/discover"
              className="mt-2 inline-block text-sm text-brand-600 hover:underline"
            >
              Add your first video →
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-2 text-sm text-brand-600 hover:underline"
            >
              Show all videos
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/research/videos/${v.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium capitalize">{v.platform}</p>
                  <StatusBadge label="discovered" active />
                  <StatusBadge label="analyzed" active={!!v.pipeline?.analyzed} />
                  <StatusBadge label="remixed" active={!!v.pipeline?.remixed} />
                </div>
                <p className="mt-1 truncate text-sm text-neutral-700">
                  {v.hook ? `"${v.hook}"` : v.caption?.slice(0, 80) ?? v.externalUrl}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">{v.externalUrl}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-neutral-500">
                {v.viralScore != null && (
                  <p className="font-medium text-brand-600">Score {v.viralScore.toFixed(1)}</p>
                )}
                {v.remixCount ? (
                  <p className="text-neutral-600">{v.remixCount} remix{v.remixCount > 1 ? 'es' : ''}</p>
                ) : null}
                <p>{new Date(v.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
