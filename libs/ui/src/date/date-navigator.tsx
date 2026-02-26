import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../shadcn/button';

interface DateNavigatorProps {
  label?: string;
  onPrevious: () => void;
  onNext: () => void;
  onLabel?: () => void;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
}

export function DateNavigator({
  label = 'Today',
  onPrevious,
  onNext,
  onLabel,
  variant = 'ghost',
  size = 'sm',
}: DateNavigatorProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant={variant} size="icon" onClick={onPrevious}>
        <ChevronLeft className="size-4" />
      </Button>
      <Button variant={variant} size={size} onClick={onLabel}>
        {label}
      </Button>
      <Button variant={variant} size="icon" onClick={onNext}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
