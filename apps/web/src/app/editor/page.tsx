'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { TextOverlay } from '@ugc-studio/shared';
import { OverlayEditor, VideoPreview } from '@/components/OverlayEditor';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { CopyButton } from '@/components/CopyButton';
import { Button, Card, Input, Label, Select } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { api, type RemixScriptRecord } from '@/lib/api';
import { uuidFromQuery } from '@/lib/uuid';

function EditorContent() {
  const params = useSearchParams();
  const scriptId = uuidFromQuery(params.get('scriptId')) || undefined;
  const { toast } = useToast();

  const [scripts, setScripts] = useState<RemixScriptRecord[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState(scriptId ?? '');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [overlays, setOverlays] = useState<TextOverlay[]>([
    {
      id: 'overlay-1',
      text: 'POV: sizing struggles',
      startSec: 0,
      endSec: 5,
      x: 50,
      y: 20,
      fontSize: 48,
      color: 'white',
    },
  ]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderResult, setRenderResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.scripts.list().then(setScripts);
  }, []);

  useEffect(() => {
    if (scriptId) setSelectedScriptId(scriptId);
  }, [scriptId]);

  useEffect(() => {
    if (!selectedScriptId) return;
    api.scripts.get(selectedScriptId).then((script) => {
      const shotList = (script.script as { shotList?: Array<{ overlayText?: string }> }).shotList ?? [];
      const fromShots = shotList
        .filter((s) => s.overlayText)
        .map((s, i) => ({
          id: `shot-${i}`,
          text: s.overlayText!,
          startSec: i * 5,
          endSec: (i + 1) * 5,
          x: 50,
          y: 20 + i * 10,
          fontSize: 48,
          color: 'white',
        }));
      if (fromShots.length > 0) setOverlays(fromShots);
    });
  }, [selectedScriptId]);

  const selectedScript = useMemo(
    () => scripts.find((s) => s.id === selectedScriptId),
    [scripts, selectedScriptId],
  );

  function handleVideoChange(file: File | null) {
    setVideoFile(file);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(file ? URL.createObjectURL(file) : null);
  }

  async function createProject() {
    setLoading(true);
    setError('');
    try {
      const project = (await api.editor.create({
        name: 'ClothME Edit',
        remixScriptId: selectedScriptId || undefined,
        editState: { trimStartSec: trimStart, trimEndSec: trimEnd, textOverlays: overlays, captionStyle: 'none' },
      })) as { id: string };
      setProjectId(project.id);
      toast('Edit project created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  async function saveAndRender() {
    if (!projectId || !videoFile) return;
    setLoading(true);
    setError('');
    try {
      await api.editor.update(projectId, {
        trimStartSec: trimStart,
        trimEndSec: trimEnd,
        textOverlays: overlays,
        captionStyle: 'bottom',
      });
      const result = await api.editor.render(projectId, videoFile);
      setRenderResult(result as Record<string, unknown>);
      toast('Render complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout maxWidth="5xl">
      <PageHeader
        title="Editor"
        description="Trim footage, add multiple text overlays, preview, and render MP4."
      />

      {!projectId ? (
        <div className="space-y-4">
          {scripts.length > 0 && (
            <div>
              <Label>Remix script (optional)</Label>
              <Select
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="mt-1"
              >
                <option value="">No script — manual edit</option>
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {(s.script as { hook?: string }).hook?.slice(0, 60) ?? s.id}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <Button onClick={createProject} disabled={loading}>
            {loading ? 'Creating…' : 'New edit project'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm text-neutral-500">Project: {projectId}</p>

            {selectedScript && (
              <Card>
                <h3 className="text-sm font-semibold">Script reference</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {(selectedScript.script as { hook?: string }).hook}
                </p>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trim start (sec)</Label>
                <Input type="number" value={trimStart} onChange={(e) => setTrimStart(Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Trim end (sec)</Label>
                <Input type="number" value={trimEnd} onChange={(e) => setTrimEnd(Number(e.target.value))} className="mt-1" />
              </div>
            </div>

            <OverlayEditor overlays={overlays} onChange={setOverlays} trimEnd={trimEnd} />

            <div>
              <Label>Source video file</Label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
                className="mt-1 text-sm"
              />
            </div>

            <Button onClick={saveAndRender} disabled={loading || !videoFile}>
              {loading ? 'Rendering…' : 'Save & render MP4'}
            </Button>

            {renderResult && (
              <Card className="border-green-200 bg-green-50">
                <p className="font-medium text-green-800">Render complete</p>
                <p className="mt-1 text-sm text-green-700">Output: {String(renderResult.outputPath)}</p>
                <div className="mt-3 flex gap-2">
                  <CopyButton text={String(renderResult.outputPath)} label="Copy path" />
                  <Link href={`/export?editProjectId=${projectId}&outputPath=${encodeURIComponent(String(renderResult.outputPath))}&scriptId=${selectedScriptId ?? ''}`}>
                    <Button size="sm">Go to Export →</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <div>
            <Label>Preview</Label>
            <div className="mt-2">
              <VideoPreview overlays={overlays} trimStart={trimStart} trimEnd={trimEnd} videoUrl={videoUrl} />
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </PageLayout>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorContent />
    </Suspense>
  );
}
