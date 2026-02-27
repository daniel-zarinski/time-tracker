import { ComponentPropsWithoutRef } from 'react';
import { cn, format, isSameDay } from '@time-tracker/utils';
import { useDayProgress } from '@time-tracker/hooks';

interface DayButtonProps extends ComponentPropsWithoutRef<'button'> {
  date: Date;
}

export function DayButton({ date, className, ...rest }: DayButtonProps) {
  const isToday = isSameDay(date, new Date());
  const progress = useDayProgress(date);

  return (
    <button
      type="button"
      className={cn(
        'group relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-muted data-[checked=true]:text-primary-foreground data-[checked=true]:hover:bg-transparent',
        className
      )}
      {...rest}
    >
      {progress > 0 && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 rounded-lg transition-all',
            progress >= 1
              ? 'bg-primary/15 group-data-[checked=true]:bg-primary-foreground/20'
              : 'bg-primary/8 group-data-[checked=true]:bg-primary-foreground/10'
          )}
          style={{ height: `${Math.min(100, progress * 100)}%` }}
        />
      )}
      <span
        className={cn(
          'relative font-medium',
          isToday && 'text-primary group-data-[checked=true]:text-inherit'
        )}
      >
        {format(date, 'EEEEE')}
      </span>
      <span className="relative flex size-6 items-center justify-center rounded-full text-xs font-semibold group-data-[checked=true]:bg-primary-foreground/20">
        {date.getDate()}
      </span>
    </button>
  );
}
