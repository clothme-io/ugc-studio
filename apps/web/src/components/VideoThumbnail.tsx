import { Instagram, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  if (platform === 'instagram') return <Instagram className={className} />;
  if (platform === 'youtube') return <Youtube className={className} />;
  return <TikTokIcon className={className} />;
}

export function VideoThumbnail({
  platform,
  className,
  large,
}: {
  platform: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-600 text-white',
        large ? 'h-48 w-28' : 'h-16 w-10',
        className,
      )}
    >
      <PlatformIcon platform={platform} className={large ? 'h-10 w-10 opacity-80' : 'h-5 w-5 opacity-80'} />
    </div>
  );
}
