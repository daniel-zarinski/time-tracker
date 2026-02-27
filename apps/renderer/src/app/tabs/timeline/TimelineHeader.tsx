import * as React from 'react';
import {
  AnimatedBackground,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  WeekDaySelector,
} from '@time-tracker/ui';
import { isSameDay } from '@time-tracker/utils';
import { LayoutGrid, List } from 'lucide-react';
import { TimelineView } from './timeline-types';
import { getWeekDays } from './timeline-utils';
import { DayButton } from './DayButton';

interface TimelineHeaderProps {
  date: Date;
  view: TimelineView;
  onViewChange: (view: TimelineView) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (date: Date) => void;
}

export function TimelineHeader({
  date,
  view,
  onViewChange,
  onPreviousWeek,
  onNextWeek,
  onSelectDay,
}: TimelineHeaderProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Stabilize weekDays by week-start so they don't recalculate on
  // same-week day clicks — keeps AnimatedBackground children stable
  // which is required for layoutId slide animation to work.
  const weekStartKey = React.useMemo(() => {
    const days = getWeekDays(date);
    return days[0].toDateString();
  }, [date]);
  const weekDays = React.useMemo(() => getWeekDays(date), [weekStartKey]);

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex items-center justify-between px-4 py-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="font-semibold">
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => {
                if (day) {
                  onSelectDay(day);
                  setCalendarOpen(false);
                }
              }}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-2 text-muted-foreground">
          <AnimatedBackground
            defaultValue={view}
            onValueChange={(id) => {
              if (id) onViewChange(id as TimelineView);
            }}
            className="rounded-md bg-background shadow-sm"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
          >
            <button
              data-id={TimelineView.Timeline}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked=true]:text-foreground"
            >
              <LayoutGrid className="size-3.5" />
              Timeline
            </button>
            <button
              data-id={TimelineView.List}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked=true]:text-foreground"
            >
              <List className="size-3.5" />
              List
            </button>
          </AnimatedBackground>
        </div>
      </div>

      <WeekDaySelector onPreviousWeek={onPreviousWeek} onNextWeek={onNextWeek}>
        <AnimatedBackground
          defaultValue={String(weekDays.findIndex((d) => isSameDay(d, date)))}
          onValueChange={(id) => {
            if (id != null) onSelectDay(weekDays[Number(id)]);
          }}
          className="rounded-lg bg-primary"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
        >
          {weekDays.map((d, i) => (
            <DayButton key={i} data-id={String(i)} date={d} />
          ))}
        </AnimatedBackground>
      </WeekDaySelector>
    </div>
  );
}
