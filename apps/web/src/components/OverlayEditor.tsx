'use client';

import type { TextOverlay } from '@ugc-studio/shared';
import { Button, Card, Input, Label } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';

function newOverlay(): TextOverlay {
  return {
    id: `overlay-${Date.now()}`,
    text: '',
    startSec: 0,
    endSec: 5,
    x: 50,
    y: 100,
    fontSize: 48,
    color: 'white',
  };
}

export function OverlayEditor({
  overlays,
  onChange,
  trimEnd,
}: {
  overlays: TextOverlay[];
  onChange: (overlays: TextOverlay[]) => void;
  trimEnd: number;
}) {
  function update(id: string, patch: Partial<TextOverlay>) {
    onChange(overlays.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function remove(id: string) {
    onChange(overlays.filter((o) => o.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Text overlays ({overlays.length})</Label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...overlays, newOverlay()])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add overlay
        </Button>
      </div>

      {overlays.length === 0 ? (
        <p className="text-sm text-neutral-500">No overlays yet. Add one to get started.</p>
      ) : (
        overlays.map((overlay, idx) => (
          <Card key={overlay.id} className="!p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Overlay {idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(overlay.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Text</Label>
                <Input
                  value={overlay.text}
                  onChange={(e) => update(overlay.id, { text: e.target.value })}
                  placeholder="POV: sizing struggles"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start (sec)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={overlay.startSec}
                    onChange={(e) => update(overlay.id, { startSec: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End (sec)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={trimEnd}
                    value={overlay.endSec}
                    onChange={(e) => update(overlay.id, { endSec: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>X %</Label>
                  <Input
                    type="number"
                    value={overlay.x}
                    onChange={(e) => update(overlay.id, { x: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Y %</Label>
                  <Input
                    type="number"
                    value={overlay.y}
                    onChange={(e) => update(overlay.id, { y: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input
                    type="number"
                    value={overlay.fontSize}
                    onChange={(e) => update(overlay.id, { fontSize: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export function VideoPreview({
  overlays,
  trimStart,
  trimEnd,
  videoUrl,
}: {
  overlays: TextOverlay[];
  trimStart: number;
  trimEnd: number;
  videoUrl?: string | null;
}) {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-600">
      {videoUrl ? (
        <video src={videoUrl} className="h-full w-full object-cover" muted />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-white/60">
          Upload video to preview
        </div>
      )}
      {overlays.map((o) => (
        <div
          key={o.id}
          className="pointer-events-none absolute px-2 text-center font-bold drop-shadow-lg"
          style={{
            left: `${o.x}%`,
            top: `${o.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${Math.max(12, o.fontSize / 3)}px`,
            color: o.color,
          }}
        >
          {o.text || '…'}
        </div>
      ))}
      <div className="absolute bottom-2 left-2 right-2 rounded bg-black/50 px-2 py-1 text-center text-xs text-white">
        {trimStart}s – {trimEnd}s
      </div>
    </div>
  );
}
