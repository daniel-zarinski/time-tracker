import { Minus, X } from 'lucide-react';
import { Button } from '@time-tracker/ui';

export function WindowControls() {
  if (typeof window === 'undefined' || window.electron?.platform !== 'win32') {
    return null;
  }

  const { closeWindow, minimizeWindow } = window.electron;

  return (
    <div
      className="flex items-center gap-0.5 pl-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-8 w-8 rounded-none hover:bg-muted"
        onClick={() => minimizeWindow()}
        aria-label="Minimize"
      >
        <Minus className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-8 w-8 rounded-none hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => closeWindow()}
        aria-label="Close"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
