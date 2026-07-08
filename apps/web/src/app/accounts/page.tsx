'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { api } from '@/lib/api';

type Account = {
  id: string;
  platform: string;
  handle: string;
  displayName?: string;
  followerCount?: number;
  isActive: boolean;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const list = (await api.accounts.list()) as Account[];
      setAccounts(list);
    } catch {
      /* API offline */
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.accounts.create({ platform, handle, displayName: displayName || undefined });
      setHandle('');
      setDisplayName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    await api.accounts.remove(id);
    await load();
  }

  return (
    <AppShell pathname="/accounts">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Social Accounts</h1>
        <p className="mt-1 text-neutral-600">
          Manage multiple TikTok and Instagram accounts for ClothME UGC.
        </p>

        <form onSubmit={handleAdd} className="mt-8 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as typeof platform)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Handle</label>
              <input
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@clothme"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Display name (optional)</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-fit rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Add account
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 space-y-3">
          {accounts.length === 0 && (
            <p className="text-sm text-neutral-500">No accounts yet. Add your first one above.</p>
          )}
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="font-medium capitalize">
                  {account.platform} · @{account.handle}
                </p>
                {account.displayName && (
                  <p className="text-sm text-neutral-500">{account.displayName}</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(account.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
