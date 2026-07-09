'use client';

import { isMockMode } from '@/lib/api';

export function MockModeBanner() {
  if (!isMockMode) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
      Mock mode — UI preview with sample data. No API or database required.
    </div>
  );
}
