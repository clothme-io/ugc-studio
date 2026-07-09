'use client';

import type { SourceVideo } from '@/lib/api';

type Props = {
  videos: SourceVideo[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyMessage?: string;
};

export function VideoSelect({ videos, value, onChange, placeholder, emptyMessage }: Props) {
  if (videos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        {emptyMessage ?? 'No videos yet. Add one in Discover first.'}
      </p>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
    >
      <option value="">{placeholder ?? 'Select a video…'}</option>
      {videos.map((v) => (
        <option key={v.id} value={v.id}>
          {v.label ?? `[${v.platform}] ${v.caption?.slice(0, 50) ?? v.externalUrl.slice(0, 50)}`}
        </option>
      ))}
    </select>
  );
}
