import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

export default function MonitorPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Monitor"
        description="Track performance of exported UGC across your social accounts — coming soon."
      />

      <Card className="border-dashed">
        <div className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <BarChart3 className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Analytics Monitor — Phase 2</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-600">
            After you manually post exported UGC, paste the post URL here to track views,
            engagement, and compare against the source viral video.
          </p>
          <ul className="mt-6 space-y-2 text-left text-sm text-neutral-600">
            <li>• Link exports to posted URLs</li>
            <li>• Views, likes, comments over time</li>
            <li>• Remix vs. source performance comparison</li>
            <li>• Weekly pipeline summary</li>
          </ul>
        </div>
      </Card>
    </PageLayout>
  );
}
