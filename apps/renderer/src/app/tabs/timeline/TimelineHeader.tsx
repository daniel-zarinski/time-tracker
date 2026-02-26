import * as React from 'react';
import {
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
import { useWeekDayProgress } from '@time-tracker/hooks';
import { LayoutGrid, List } from 'lucide-react';
import { TimelineView } from './timeline-types';

interface TimelineHeaderProps {
  date: Date;
  today: Date;
  weekDays: Date[];
  view: TimelineView;
  onViewChange: (view: TimelineView) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (date: Date) => void;
}

export function TimelineHeader({
  date,
  today,
  weekDays,
  view,
  onViewChange,
  onPreviousWeek,
  onNextWeek,
  onSelectDay,
}: TimelineHeaderProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const dayProgress = useWeekDayProgress(weekDays);

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

      <WeekDaySelector
        weekDays={weekDays}
        selectedDate={date}
        today={today}
        dayProgress={dayProgress}
        onSelectDay={onSelectDay}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />
    </div>
  );
}
