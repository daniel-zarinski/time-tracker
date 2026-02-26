import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@time-tracker/ui';
import { cn } from '@time-tracker/utils';
import { DAY_LETTERS, isSameDay } from './timeline-utils';

interface TimelineHeaderProps {
  date: Date;
  today: Date;
  weekDays: Date[];
  onNav: (delta: number) => void;
  onNavWeek: (delta: number) => void;
  onSelectDay: (date: Date) => void;
  onToday: () => void;
}

export function TimelineHeader({
  date,
  today,
  weekDays,
  onNav,
  onNavWeek,
  onSelectDay,
  onToday,
}: TimelineHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-semibold">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onNav(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onNav(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Week day selector */}
      <div className="sticky top-[41px] z-30 flex items-center border-b border-border bg-background px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onNavWeek(-1)}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <div className="flex flex-1 justify-around">
          {weekDays.map((d, i) => {
            const isSelected = isSameDay(d, date);
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
          onClick={() => onNavWeek(1)}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </>
  );
}
