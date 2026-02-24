import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@time-tracker/ui';
import { Home } from 'lucide-react';

export function HomeTab() {
  return (
    <Empty className="w-full max-w-md mx-auto">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Home />
        </EmptyMedia>
        <EmptyTitle>Welcome to Time Tracker</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
