'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { CopyButton } from '@/components/CopyButton';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';

type Account = { id: string; platform: string; handle: string };

function ExportContent() {
  const params = useSearchParams();
  const { toast } = useToast();

  const [outputPath, setOutputPath] = useState(params.get('outputPath') ?? '');
  const [editProjectId, setEditProjectId] = useState(params.get('editProjectId') ?? '');
  const [aiUgcJobId, setAiUgcJobId] = useState(params.get('aiUgcJobId') ?? '');
  const [scriptId, setScriptId] = useState(params.get('scriptId') ?? '');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.accounts.list().then((list) => setAccounts(list as Account[]));
    api.exports.list().then((list) => setExports(list as Record<string, unknown>[]));
  }, []);

  useEffect(() => {
    if (!scriptId) return;
    api.scripts.get(scriptId).then((script) => {
      const data = script.script as { caption?: string; hashtags?: string[] };
      if (data.caption) setCaption(data.caption);
      if (data.hashtags?.length) {
        setHashtags(data.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '));
      }
    });
  }, [scriptId]);

  function toggleAccount(id: string) {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  const fullCaption = `${caption}${hashtags ? '\n\n' + hashtags : ''}`;

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.exports.create({
        outputPath,
        caption,
        hashtags,
        editProjectId: editProjectId || undefined,
        aiUgcJobId: aiUgcJobId || undefined,
        remixScriptId: scriptId || undefined,
        targetAccountIds: selectedAccounts.length ? selectedAccounts : undefined,
      });
      const list = (await api.exports.list()) as Record<string, unknown>[];
      setExports(list);
      toast('Export saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }

  function handleMockDownload() {
    toast('Mock download started');
  }

  return (
    <PageLayout>
      <PageHeader
        title="Export"
        description="Download your rendered video and copy caption/hashtags for manual posting."
      />

      <form onSubmit={handleExport} className="space-y-4">
        <Card>
          <div>
            <label className="block text-sm font-medium">Output file path</label>
            <Input
              required
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          {outputPath && (
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleMockDownload}>
                Download MP4 (mock)
              </Button>
              <CopyButton text={outputPath} label="Copy path" />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <label className="block text-sm font-medium">Caption</label>
            <CopyButton text={fullCaption} />
          </div>
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className="mt-1" />
          <div className="mt-3">
            <label className="block text-sm font-medium">Hashtags</label>
            <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} className="mt-1" />
          </div>
        </Card>

        {accounts.length > 0 && (
          <Card>
            <label className="block text-sm font-medium">Target accounts</label>
            <div className="mt-2 space-y-2">
              {accounts.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(a.id)}
                    onChange={() => toggleAccount(a.id)}
                  />
                  {a.platform} · @{a.handle}
                </label>
              ))}
            </div>
          </Card>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save export record'}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {exports.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold">Recent exports</h2>
          <ul className="mt-3 space-y-2">
            {exports.map((exp) => (
              <li key={String(exp.id)} className="rounded-lg border border-neutral-200 bg-white p-3 text-sm">
                <p className="font-mono text-xs text-neutral-500">{String(exp.outputPath)}</p>
                <p className="mt-1">{String(exp.caption)}</p>
                <CopyButton text={String(exp.caption)} label="Copy caption" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageLayout>
  );
}

export default function ExportPage() {
  return (
    <Suspense>
      <ExportContent />
    </Suspense>
  );
}
