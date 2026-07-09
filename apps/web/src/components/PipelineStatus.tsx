import { Badge } from '@/components/ui';

export function PipelineStatus({
  discovered = true,
  analyzed = false,
  remixed = false,
}: {
  discovered?: boolean;
  analyzed?: boolean;
  remixed?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={discovered ? 'success' : 'neutral'}>discovered</Badge>
      <Badge variant={analyzed ? 'success' : 'neutral'}>analyzed</Badge>
      <Badge variant={remixed ? 'success' : 'neutral'}>remixed</Badge>
    </div>
  );
}
