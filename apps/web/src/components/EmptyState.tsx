import Link from 'next/link';
import { Button } from '@/components/ui';

export function EmptyState({
  message,
  actionLabel,
  actionHref,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
      <p className="text-neutral-600">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-3 inline-block">
          <Button variant="primary" size="sm">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-3" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
