import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../shadcn/button';
import { motion } from 'motion/react';

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
    <motion.div
      className="flex items-center px-2 py-2"
      layoutId="week-day-selector"
    >
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
    </motion.div>
  );
}
