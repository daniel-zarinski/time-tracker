import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../shadcn/button';
import { cn } from '@time-tracker/utils';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface WeekDaySelectorProps {
  weekDays: Date[];
  selectedDate: Date;
  today: Date;
  dayProgress?: Map<number, number>;
  onSelectDay: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeekDaySelector({
  weekDays,
  selectedDate,
  today,
  dayProgress,
  onSelectDay,
  onPreviousWeek,
  onNextWeek,
}: WeekDaySelectorProps) {
  return (
    <div className="flex items-center px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onPreviousWeek}
      >
        <ChevronLeft className="size-3.5" />
      </Button>
      <div className="flex flex-1 justify-around">
        {weekDays.map((d, i) => {
          const isSelected = isSameDay(d, selectedDate);
          const isDayToday = isSameDay(d, today);
          const progress = dayProgress?.get(i) ?? 0;
          return (
            <button
              key={i}
              onClick={() => onSelectDay(d)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors overflow-hidden',
                !isSelected && !isDayToday && 'text-foreground hover:bg-muted',
                !isSelected && isDayToday && 'text-primary hover:bg-muted',
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
              <span className="relative font-medium">{DAY_LETTERS[i]}</span>
              <span
                className={cn(
                  'relative flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                  isSelected && 'bg-primary-foreground/20'
                )}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onNextWeek}
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
}
