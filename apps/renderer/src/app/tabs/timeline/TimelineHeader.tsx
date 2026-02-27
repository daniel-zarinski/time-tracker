import * as React from 'react';
import {
  AnimatedBackground,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
  WeekDaySelector,
} from '@time-tracker/ui';
import { isSameDay } from '@time-tracker/utils';
import { LayoutGrid, List } from 'lucide-react';
import { TimelineView } from './timeline-types';
import { getWeekDays } from './timeline-utils';
import { DayButtonContent } from './DayButton';

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
        <Tabs
          value={view}
          onValueChange={(v) => onViewChange(v as TimelineView)}
        >
          <TabsList variant="line">
            <TabsTrigger value={TimelineView.Timeline}>
              <LayoutGrid className="size-3.5" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value={TimelineView.List}>
              <List className="size-3.5" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
            <button
              key={i}
              data-id={String(i)}
              type="button"
              className="group flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-muted data-[checked=true]:text-primary-foreground data-[checked=true]:hover:bg-transparent"
            >
              <DayButtonContent date={d} />
            </button>
          ))}
        </AnimatedBackground>
      </WeekDaySelector>
    </div>
  );
}
