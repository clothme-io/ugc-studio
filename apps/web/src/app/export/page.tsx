'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

type Account = { id: string; platform: string; handle: string };

function ExportContent() {
  const params = useSearchParams();
  const [outputPath, setOutputPath] = useState(params.get('outputPath') ?? '');
  const [editProjectId, setEditProjectId] = useState(params.get('editProjectId') ?? '');
  const [aiUgcJobId, setAiUgcJobId] = useState(params.get('aiUgcJobId') ?? '');
  const [caption, setCaption] = useState('Never guess your size again 👗📱 #clothme #fashion #sizing');
  const [hashtags, setHashtags] = useState('#clothme #fashion #sizing #tryon #bodyscan');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.accounts.list().then((list) => setAccounts(list as Account[]));
    api.exports.list().then((list) => setExports(list as Record<string, unknown>[]));
  }, []);

  function toggleAccount(id: string) {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

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
        targetAccountIds: selectedAccounts.length ? selectedAccounts : undefined,
      });
      const list = (await api.exports.list()) as Record<string, unknown>[];
      setExports(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Export</h1>
      <p className="mt-1 text-neutral-600">
        Download your rendered video and copy caption/hashtags for manual posting to TikTok or Instagram.
      </p>

      <form onSubmit={handleExport} className="mt-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
        <div>
          <label className="block text-sm font-medium">Output file path</label>
          <input
            required
            value={outputPath}
            onChange={(e) => setOutputPath(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Hashtags</label>
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {accounts.length > 0 && (
          <div>
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
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save export record'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {exports.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold">Recent exports</h2>
          <ul className="mt-3 space-y-2">
            {exports.map((exp) => (
              <li
                key={String(exp.id)}
                className="rounded-lg border border-neutral-200 bg-white p-3 text-sm"
              >
                <p className="font-mono text-xs text-neutral-500">{String(exp.outputPath)}</p>
                <p className="mt-1">{String(exp.caption)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ExportPage() {
  return (
    <AppShell pathname="/export">
      <Suspense>
        <ExportContent />
      </Suspense>
    </AppShell>
  );
}
