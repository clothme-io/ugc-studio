'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { PlatformIcon } from '@/components/VideoThumbnail';
import { Button, Card, Input, Select, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Toast';
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
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const list = (await api.accounts.list()) as Account[];
      setAccounts(list);
    } catch {
      /* API offline */
    } finally {
      setPageLoading(false);
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
      toast('Account added');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    await api.accounts.remove(id);
    toast('Account removed');
    await load();
  }

  return (
    <PageLayout>
      <PageHeader
        title="Social Accounts"
        description="Manage multiple TikTok and Instagram accounts for ClothME UGC."
      />

      <Card>
        <form onSubmit={handleAdd} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Platform</label>
              <Select value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)} className="mt-1">
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium">Handle</label>
              <Input
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@clothme"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Display name (optional)</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-fit">
            Add account
          </Button>
        </form>
      </Card>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 space-y-3">
        {pageLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : accounts.length === 0 ? (
          <EmptyState message="No accounts yet. Add your first one above." />
        ) : (
          accounts.map((account) => (
            <Card key={account.id} className="flex items-center justify-between !p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                  <PlatformIcon platform={account.platform} className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {account.platform} · @{account.handle}
                  </p>
                  {account.displayName && (
                    <p className="text-sm text-neutral-500">{account.displayName}</p>
                  )}
                  {account.followerCount != null && (
                    <p className="text-xs text-neutral-400">{account.followerCount.toLocaleString()} followers</p>
                  )}
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => handleRemove(account.id)}>
                Remove
              </Button>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}
