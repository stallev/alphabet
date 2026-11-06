import { Badge } from '@/shared/ui/Badge';

/** Display-метки для доменного enum `QuestionSuite.sourceType`. */
const SOURCE_LABELS: Record<string, string> = {
  json: 'JSON',
  manual: 'Вручную',
  ai: 'AI',
  system: 'Система',
};

export interface SuiteSourceBadgeProps {
  sourceType: string;
}

export function SuiteSourceBadge({ sourceType }: SuiteSourceBadgeProps) {
  return <Badge>{SOURCE_LABELS[sourceType] ?? sourceType}</Badge>;
}
