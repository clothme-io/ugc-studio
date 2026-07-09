import { PageContent } from '@/components/PageContent';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui';
import { Eye } from 'lucide-react';

export default function AccountSpyPage() {
  return (
    <PageContent>
      <PageHeader
        title="Account Spy"
        description="Monitor competitor and inspiration accounts — coming soon."
      />

      <Card className="border-dashed">
        <div className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Eye className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Account Spy — Phase 2</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-600">
            Track competitor TikTok and Instagram accounts, surface their top-performing UGC,
            and one-click add viral videos to your Research library.
          </p>
          <ul className="mt-6 space-y-2 text-left text-sm text-neutral-600">
            <li>• Follow accounts by handle</li>
            <li>• Auto-ingest new posts above a viral threshold</li>
            <li>• Compare hook patterns across accounts</li>
            <li>• Alert when a competitor posts high-performing content</li>
          </ul>
        </div>
      </Card>
    </PageContent>
  );
}
