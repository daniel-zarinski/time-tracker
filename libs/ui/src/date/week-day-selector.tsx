import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../shadcn/button';

interface WeekDaySelectorProps {
  children: React.ReactNode;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeekDaySelector({
  children,
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
      <div className="flex flex-1 justify-around">{children}</div>
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
