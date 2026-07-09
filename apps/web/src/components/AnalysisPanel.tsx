'use client';

import type { VideoAnalysisRecord } from '@/lib/api';
import { Card, Badge } from '@/components/ui';
import { CopyButton } from '@/components/CopyButton';

type AnalysisData = {
  format?: string;
  hook?: string;
  hookType?: string;
  durationSec?: number;
  structure?: Array<{ segment: string; start: number; end: number; notes?: string }>;
  cta?: string;
  textOverlays?: string[];
  musicStyle?: string;
  replicabilityScore?: number;
};

export function AnalysisPanel({ analysis }: { analysis: VideoAnalysisRecord }) {
  const data = analysis.analysis as AnalysisData;
  const structure = data.structure ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-semibold">Structure</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-neutral-500">Format</dt>
            <dd className="font-medium">{data.format ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Hook type</dt>
            <dd className="font-medium capitalize">{data.hookType?.replace(/_/g, ' ') ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Duration</dt>
            <dd className="font-medium">{data.durationSec ? `${data.durationSec}s` : '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Replicability</dt>
            <dd className="font-medium">
              {data.replicabilityScore != null ? `${data.replicabilityScore}/10` : '—'}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-500">Hook</dt>
            <dd className="mt-1 font-medium">&ldquo;{data.hook ?? '—'}&rdquo;</dd>
            {data.hook && <CopyButton text={data.hook} />}
          </div>
          <div className="col-span-2">
            <dt className="text-neutral-500">CTA</dt>
            <dd className="font-medium">{data.cta ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Music</dt>
            <dd className="font-medium capitalize">{data.musicStyle?.replace(/_/g, ' ') ?? '—'}</dd>
          </div>
        </dl>
      </Card>

      {structure.length > 0 && (
        <Card>
          <h2 className="font-semibold">Timeline</h2>
          <div className="mt-4 space-y-2">
            {structure.map((seg) => (
              <div
                key={`${seg.segment}-${seg.start}`}
                className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm"
              >
                <Badge variant="brand">{seg.segment}</Badge>
                <span className="font-mono text-xs text-neutral-500">
                  {seg.start}s – {seg.end}s
                </span>
                {seg.notes && <span className="text-neutral-600">{seg.notes}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.textOverlays && data.textOverlays.length > 0 && (
        <Card>
          <h2 className="font-semibold">Text overlays</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {data.textOverlays.map((t) => (
              <li key={t} className="rounded bg-neutral-50 px-3 py-2">
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.transcript && (
        <Card>
          <h2 className="font-semibold">Transcript</h2>
          <p className="mt-2 text-sm text-neutral-700">{analysis.transcript}</p>
        </Card>
      )}
    </div>
  );
}
