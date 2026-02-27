import { AnimatedBackground } from '@time-tracker/ui';
import { useAppStore, TabValue } from '../store';

const tabs: { id: TabValue; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'jira-issues', label: 'Jira Issues' },
  { id: 'settings', label: 'Settings' },
];

export function MainTabList() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <div
      className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <AnimatedBackground
        defaultValue={activeTab}
        onValueChange={(id) => {
          if (id) setActiveTab(id as TabValue);
        }}
        className="rounded-md bg-background shadow-sm"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-id={tab.id}
            type="button"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked=true]:text-foreground"
          >
            {tab.label}
          </button>
        ))}
      </AnimatedBackground>
    </div>
  );
}
