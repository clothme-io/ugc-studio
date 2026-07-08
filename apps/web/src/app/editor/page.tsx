'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

function EditorContent() {
  const params = useSearchParams();
  const scriptId = params.get('scriptId') ?? undefined;
  const [projectId, setProjectId] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [overlayText, setOverlayText] = useState('POV: sizing struggles');
  const [overlayStart, setOverlayStart] = useState(0);
  const [overlayEnd, setOverlayEnd] = useState(5);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderResult, setRenderResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function createProject() {
    setLoading(true);
    setError('');
    try {
      const project = (await api.editor.create({
        name: 'ClothME Edit',
        remixScriptId: scriptId,
        editState: {
          trimStartSec: trimStart,
          trimEndSec: trimEnd,
          textOverlays: [],
          captionStyle: 'none',
        },
      })) as { id: string };
      setProjectId(project.id);
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
        textOverlays: [
          {
            id: '1',
            text: overlayText,
            startSec: overlayStart,
            endSec: overlayEnd,
            x: 50,
            y: 100,
            fontSize: 48,
            color: 'white',
          },
        ],
        captionStyle: 'bottom',
      });
      const result = await api.editor.render(projectId, videoFile);
      setRenderResult(result as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render failed — is FFmpeg installed?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Editor</h1>
      <p className="mt-1 text-neutral-600">
        Basic trim and text overlays. Upload footage, set in/out points, add text, render MP4.
      </p>

      {!projectId ? (
        <button
          onClick={createProject}
          disabled={loading}
          className="mt-8 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'New edit project'}
        </button>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-neutral-500">Project ID: {projectId}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Trim start (sec)</label>
              <input
                type="number"
                value={trimStart}
                onChange={(e) => setTrimStart(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Trim end (sec)</label>
              <input
                type="number"
                value={trimEnd}
                onChange={(e) => setTrimEnd(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Text overlay</label>
            <input
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                type="number"
                value={overlayStart}
                onChange={(e) => setOverlayStart(Number(e.target.value))}
                placeholder="Start sec"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={overlayEnd}
                onChange={(e) => setOverlayEnd(Number(e.target.value))}
                placeholder="End sec"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Source video file</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className="mt-1 text-sm"
            />
          </div>

          <button
            onClick={saveAndRender}
            disabled={loading || !videoFile}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Rendering…' : 'Save & render MP4'}
          </button>

          {renderResult && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-800">Render complete</p>
              <p className="mt-1 text-sm text-green-700">
                Output: {String(renderResult.outputPath)}
              </p>
              <a
                href={`/export?editProjectId=${projectId}&outputPath=${encodeURIComponent(String(renderResult.outputPath))}`}
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                Go to Export →
              </a>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function EditorPage() {
  return (
    <AppShell pathname="/editor">
      <Suspense>
        <EditorContent />
      </Suspense>
    </AppShell>
  );
}
