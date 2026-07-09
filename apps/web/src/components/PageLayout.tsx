import { AppShell } from '@/components/AppShell';

export function PageLayout({
  children,
  maxWidth = '3xl',
}: {
  children: React.ReactNode;
  maxWidth?: '3xl' | '4xl' | '5xl' | 'full';
}) {
  const widthClass =
    maxWidth === 'full'
      ? 'max-w-full'
      : maxWidth === '5xl'
        ? 'max-w-5xl'
        : maxWidth === '4xl'
          ? 'max-w-4xl'
          : 'max-w-3xl';

  return (
    <AppShell>
      <div className={`mx-auto ${widthClass} p-8`}>{children}</div>
    </AppShell>
  );
}
