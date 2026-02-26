import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
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
  onSelectDay: (date: Date) => void;
  onNavigateWeek: (delta: number) => void;
}

export function WeekDaySelector({
  weekDays,
  selectedDate,
  today,
  onSelectDay,
  onNavigateWeek,
}: WeekDaySelectorProps) {
  return (
    <div className="flex items-center px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => onNavigateWeek(-1)}
      >
        <ChevronLeft className="size-3.5" />
      </Button>
      <div className="flex flex-1 justify-around">
        {weekDays.map((d, i) => {
          const isSelected = isSameDay(d, selectedDate);
          const isDayToday = isSameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => onSelectDay(d)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors',
                !isSelected && !isDayToday && 'text-foreground hover:bg-muted',
                !isSelected && isDayToday && 'text-primary hover:bg-muted',
                isSelected && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="font-medium">{DAY_LETTERS[i]}</span>
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
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
        onClick={() => onNavigateWeek(1)}
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
}
