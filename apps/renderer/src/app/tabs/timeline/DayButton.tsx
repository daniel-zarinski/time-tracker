import { cn, format } from '@time-tracker/utils';
import { useDayProgress } from '@time-tracker/hooks';

interface DayButtonProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  onSelect: () => void;
}

export function DayButton({
  date,
  isSelected,
  isToday,
  onSelect,
}: DayButtonProps) {
  const progress = useDayProgress(date);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors overflow-hidden',
        !isSelected && !isToday && 'text-foreground hover:bg-muted',
        !isSelected && isToday && 'text-primary hover:bg-muted',
        isSelected && 'bg-primary text-primary-foreground'
      )}
    >
      {progress > 0 && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 rounded-lg transition-all',
            isSelected
              ? progress >= 1
                ? 'bg-primary-foreground/20'
                : 'bg-primary-foreground/10'
              : progress >= 1
                ? 'bg-primary/15'
                : 'bg-primary/8'
          )}
          style={{ height: `${Math.min(100, progress * 100)}%` }}
        />
      )}
      <span className="relative font-medium">{format(date, 'EEEEE')}</span>
      <span
        className={cn(
          'relative flex size-6 items-center justify-center rounded-full text-xs font-semibold',
          isSelected && 'bg-primary-foreground/20'
        )}
      >
        {date.getDate()}
      </span>
    </button>
  );
}
