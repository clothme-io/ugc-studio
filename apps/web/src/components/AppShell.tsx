import Link from 'next/link';
import {
  Clapperboard,
  Download,
  LayoutDashboard,
  Link2,
  PenLine,
  ScanSearch,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/discover', label: 'Discover', icon: Link2 },
  { href: '/analyze', label: 'Analyze', icon: ScanSearch },
  { href: '/remix', label: 'Remix', icon: PenLine },
  { href: '/editor', label: 'Editor', icon: Clapperboard },
  { href: '/ai-ugc', label: 'AI UGC', icon: Sparkles },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/export', label: 'Export', icon: Download },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6 text-brand-600" />
          <div>
            <p className="text-sm font-semibold">UGC Studio</p>
            <p className="text-xs text-neutral-500">ClothME Internal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-brand-50 text-brand-700'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function AppShell({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  return (
    <>
      <Sidebar pathname={pathname} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </>
  );
}
