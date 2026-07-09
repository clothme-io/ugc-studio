import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { api, isMockMode } from '@/lib/api';

export default async function DashboardPage() {
  let health: { status: string; services: { database: string; openai: boolean; heygen: boolean } } = {
    status: 'unknown',
    services: { database: 'error', openai: false, heygen: false },
  };
  try {
    health = await api.health();
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
    <AppShell>
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold tracking-tight">UGC Studio</h1>
        <p className="mt-2 text-neutral-600">
          Internal pipeline to discover, analyze, remix, and export UGC for ClothME.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {isMockMode && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Mock mode
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              health.services.database === 'connected' || health.services.database === 'mock'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            Database {health.services.database === 'mock' ? 'mock' : health.services.database === 'connected' ? 'connected' : 'offline'}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              health.status === 'ok'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            API {health.status === 'ok' ? 'online' : 'degraded'}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
            OpenAI {health.services.openai ? '✓' : 'mock mode'}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
            HeyGen {health.services.heygen ? '✓' : 'mock mode'}
          </span>
        </div>

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
      </div>
    </AppShell>
  );
}
