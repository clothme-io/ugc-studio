import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, Badge } from '@/components/ui';
import { api, isMockMode } from '@/lib/api';

export default async function DashboardPage() {
  let health: {
    status: string;
    services: {
      database: string;
      openai: boolean;
      heygen: boolean;
      llm?: { configured: boolean; provider: string | null; model: string | null };
    };
  } = {
    status: 'unknown',
    services: { database: 'error', openai: false, heygen: false },
  };
  let activity: Array<{ id: string; type: string; label: string; href: string; createdAt: string }> = [];

  try {
    [health, activity] = await Promise.all([api.health(), api.activity.list()]);
  } catch {
    /* API offline during dev */
  }

  const steps = [
    { step: 1, title: 'Discover', href: '/research/discover', desc: 'Paste a viral video URL into your library' },
    { step: 2, title: 'Analyze', href: '/research/analyze', desc: 'Pick from library — break down hook, structure, CTA' },
    { step: 3, title: 'Remix', href: '/research/remix', desc: 'Pick analyzed video — generate ClothME script' },
    { step: 4, title: 'Avatars', href: '/avatars', desc: 'Create AI personas with full profiles' },
    { step: 5, title: 'AI UGC or Editor', href: '/ai-ugc', desc: 'Generate avatar video or edit footage' },
    { step: 6, title: 'Export', href: '/export', desc: 'Download MP4 and copy caption for posting' },
  ];

  return (
    <PageLayout maxWidth="4xl">
      <PageHeader
        title="UGC Studio"
        description="Internal pipeline to discover, analyze, remix, and export UGC for ClothME."
      />

      <div className="flex flex-wrap gap-3">
        {isMockMode && <Badge variant="warning">Mock mode</Badge>}
        <Badge variant={health.services.database === 'connected' || health.services.database === 'mock' ? 'success' : 'neutral'}>
          Database {health.services.database === 'mock' ? 'mock' : health.services.database === 'connected' ? 'connected' : 'offline'}
        </Badge>
        <Badge variant={health.status === 'ok' ? 'success' : 'warning'}>
          API {health.status === 'ok' ? 'online' : 'degraded'}
        </Badge>
        <Badge variant={health.services.openai ? 'success' : 'neutral'}>
          LLM{' '}
          {health.services.llm?.configured
            ? `${health.services.llm.provider} (${health.services.llm.model})`
            : health.services.openai
              ? '✓'
              : 'not configured'}
        </Badge>
        <Badge variant="neutral">HeyGen {health.services.heygen ? '✓' : 'mock'}</Badge>
      </div>

      {activity.length > 0 && (
        <Card className="mt-8">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-3 divide-y divide-neutral-100">
            {activity.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600">
                  <span className="flex items-center gap-2">
                    <Badge variant="brand">{item.type}</Badge>
                    {item.label}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-10 grid gap-4">
        {steps.map(({ step, title, href, desc }) => (
          <Link
            key={step}
            href={href}
            className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {step}
            </span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-neutral-600">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
