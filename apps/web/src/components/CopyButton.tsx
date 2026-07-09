'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast('Copied to clipboard');
      }}
    >
      <Copy className="mr-1 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
