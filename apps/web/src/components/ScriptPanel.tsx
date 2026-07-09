'use client';

import type { RemixScriptRecord } from '@/lib/api';
import { Card, Badge } from '@/components/ui';
import { CopyButton } from '@/components/CopyButton';

type ScriptData = {
  hook?: string;
  hookVariants?: string[];
  body?: string;
  cta?: string;
  shotList?: Array<{
    segment: string;
    durationSec: number;
    visual: string;
    overlayText?: string;
  }>;
  caption?: string;
  hashtags?: string[];
};

export function ScriptPanel({ script }: { script: RemixScriptRecord }) {
  const data = script.script as ScriptData;
  const hookVariants = data.hookVariants ?? [];
  const shotList = data.shotList ?? [];
  const hashtags = data.hashtags ?? [];
  const fullCaption = data.caption
    ? `${data.caption}${hashtags.length ? ' ' + hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ') : ''}`
    : '';

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold">Hook</h2>
          {data.hook && <CopyButton text={data.hook} />}
        </div>
        <p className="mt-2 text-lg">{data.hook ?? '—'}</p>
        {hookVariants.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-neutral-500">A/B variants</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {hookVariants.map((v) => (
                <li key={v} className="flex items-center justify-between rounded bg-neutral-50 px-3 py-2">
                  <span>{v}</span>
                  <CopyButton text={v} label="" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {data.body && (
        <Card>
          <h2 className="font-semibold">Body</h2>
          <p className="mt-2 text-sm text-neutral-700">{data.body}</p>
        </Card>
      )}

      {data.cta && (
        <Card>
          <h2 className="font-semibold">CTA</h2>
          <p className="mt-2 text-sm">{data.cta}</p>
        </Card>
      )}

      {shotList.length > 0 && (
        <Card>
          <h2 className="font-semibold">Shot list</h2>
          <div className="mt-3 space-y-3">
            {shotList.map((shot, i) => (
              <div key={i} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{shot.segment}</Badge>
                  <span className="text-xs text-neutral-500">{shot.durationSec}s</span>
                </div>
                <p className="mt-1 text-neutral-700">{shot.visual}</p>
                {shot.overlayText && (
                  <p className="mt-1 text-xs text-neutral-500">Overlay: &ldquo;{shot.overlayText}&rdquo;</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold">Caption & hashtags</h2>
          {fullCaption && <CopyButton text={fullCaption} />}
        </div>
        <p className="mt-2 text-sm">{data.caption ?? '—'}</p>
        {hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hashtags.map((h) => (
              <Badge key={h} variant="neutral">
                {h.startsWith('#') ? h : `#${h}`}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
