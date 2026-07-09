'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Clapperboard,
  Download,
  FlaskConical,
  LayoutDashboard,
  PenLine,
  ScanSearch,
  Sparkles,
  UserCircle2,
  Users,
  Video,
  Link2,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/research/discover', label: 'Research', icon: FlaskConical, section: 'research' },
  { href: '/editor', label: 'Editor', icon: Clapperboard },
  { href: '/ai-ugc', label: 'AI UGC', icon: Sparkles },
  { href: '/avatars', label: 'Avatars', icon: UserCircle2, section: 'avatars' },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/export', label: 'Export', icon: Download },
];

const researchNav = [
  { href: '/research/discover', label: 'Discover', icon: Link2 },
  { href: '/research/analyze', label: 'Analyze', icon: ScanSearch },
  { href: '/research/remix', label: 'Remix', icon: PenLine },
  { href: '/research/library', label: 'Library', icon: Library },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/research/discover') return pathname.startsWith('/research');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inResearch = pathname.startsWith('/research');

  return (
    <>
      <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold">UGC Studio</p>
              <p className="text-xs text-neutral-500">ClothME Internal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {mainNav.map(({ href, label, icon: Icon, section }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                (section === 'research' ? inResearch : isActive(pathname, href))
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {inResearch && (
        <aside className="flex h-screen w-48 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
          <div className="border-b border-neutral-200 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <BookOpen className="h-4 w-4" />
              Research
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {researchNav.map(({ href, label, icon: Icon }) => {
              const isLibrarySection =
                href === '/research/library' &&
                (pathname === href ||
                  pathname.startsWith('/research/videos/'));
              const isActive =
                isLibrarySection ||
                (href !== '/research/library' &&
                  (pathname === href || pathname.startsWith(`${href}/`)));

              return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-white/80 hover:text-neutral-900',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <main className="flex-1 overflow-auto">{children}</main>
    </>
  );
}
