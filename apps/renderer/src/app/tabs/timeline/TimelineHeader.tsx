import * as React from 'react';
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  WeekDaySelector,
} from '@time-tracker/ui';

interface TimelineHeaderProps {
  date: Date;
  today: Date;
  weekDays: Date[];
  onNavWeek: (delta: number) => void;
  onSelectDay: (date: Date) => void;
}

export function TimelineHeader({
  date,
  today,
  weekDays,
  onNavWeek,
  onSelectDay,
}: TimelineHeaderProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button className="text-sm font-semibold hover:text-primary transition-colors">
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </button>
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
        <Button variant="ghost" size="sm">
          List View
        </Button>
      </div>

      {/* Week day selector */}
      <div className="sticky top-[41px] z-30 border-b border-border bg-background">
        <WeekDaySelector
          weekDays={weekDays}
          selectedDate={date}
          today={today}
          onSelectDay={onSelectDay}
          onNavigateWeek={onNavWeek}
        />
      </div>
    </>
  );
}
