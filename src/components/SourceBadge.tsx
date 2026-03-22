import { RotateCcw, Sparkles, Database, Search } from 'lucide-react';
import { MessageSource } from '../types';

interface SourceBadgeProps {
  source: MessageSource;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  const isCached = source.cached === true;
  const hasDocuments = (source.documentsUsed?.length ?? 0) > 0;
  const isReused = source.type === 'reused';

  let label: string;
  let icon: React.ReactNode;
  let colorClasses: string;

  if (isCached) {
    label = 'Cached Response';
    icon = <Database size={12} />;
    colorClasses = 'bg-purple-50 text-purple-700 border border-purple-200';
  } else if (isReused) {
    label = 'Reused Answer';
    icon = <RotateCcw size={12} />;
    colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
  } else if (hasDocuments) {
    label = 'Semantic Search';
    icon = <Search size={12} />;
    colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200';
  } else {
    label = 'New Answer';
    icon = <Sparkles size={12} />;
    colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses}`}
    >
      {icon}
      {label}
      {source.confidence !== undefined && (
        <span className="text-[10px] opacity-70">
          ({Math.round(source.confidence * 100)}%)
        </span>
      )}
    </div>
  );
}
