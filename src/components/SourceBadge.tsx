import { RotateCcw, Sparkles } from 'lucide-react';
import { MessageSource } from '../types';

interface SourceBadgeProps {
  source: MessageSource;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  const isReused = source.type === 'reused';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isReused
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}
    >
      {isReused ? <RotateCcw size={12} /> : <Sparkles size={12} />}
      {isReused ? 'Reused Answer' : 'New Answer'}
      {source.confidence !== undefined && (
        <span className="text-[10px] opacity-70">
          ({Math.round(source.confidence * 100)}%)
        </span>
      )}
    </div>
  );
}
