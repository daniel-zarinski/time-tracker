import * as React from 'react';
import { Search } from 'lucide-react';

import {
  Button,
  CommandPalette,
  DEFAULT_TRANSITION,
  Dialog,
  DialogContent,
  TransitionPanel,
} from '@time-tracker/ui';
import { useJiraIssue, useTimeEntryMutations } from '@time-tracker/hooks';

import { SettingsTab, JiraIssuesTab, MainTabList } from './tabs';
import { useAppStore } from './store';
import { useAppCommands } from './use-app-commands';
import { TimelineTab } from './tabs/timeline';
import { JiraIssueCard } from './components/cards/jira-issue-card';

export function App() {
  const activeTab = useAppStore.use.activeTab();
  const selectedIssueKey = useAppStore.use.selectedIssueKey();
  const setSelectedIssueKey = useAppStore.use.setSelectedIssueKey();
  const setSelectedTimeEntry = useAppStore.use.setSelectedTimeEntry();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { commands } = useAppCommands();

  const issueQuery = useJiraIssue(selectedIssueKey);
  const { startTracking } = useTimeEntryMutations();

  const tabIndexMap = { home: 0, 'jira-issues': 1, settings: 2 } as const;
  const activeTabIndex = tabIndexMap[activeTab];

  return (
    <div className="flex h-screen flex-col text-foreground">
      <div className="flex h-full flex-col gap-0">
        <header
          className="sticky top-0 z-40 flex items-center justify-between bg-background pt-2"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <div className="flex-1" aria-hidden />
          <MainTabList />
          <div className="flex min-w-0 flex-1 justify-end pr-2">
            <CommandPalette
              open={commandOpen}
              onOpenChange={setCommandOpen}
              shortcut="mod+f"
              placeholder="Type a command..."
              emptyMessage="No results found."
              trigger={
                <Button variant="ghost" size="icon">
                  <Search />
                </Button>
              }
              commands={commands}
            />
          </div>
        </header>

        <main
          className="flex min-h-0 flex-1 flex-col bg-muted"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <TransitionPanel
            activeIndex={activeTabIndex}
            mode="sync"
            layoutMode="overlay"
            transition={{ duration: 0.2, ease: DEFAULT_TRANSITION.ease }}
            variants={{
              enter: { opacity: 0 },
              center: { opacity: 1 },
              exit: { opacity: 0, filter: 'blur(4px)' },
            }}
            className="flex-1 overflow-y-auto"
          >
            <TimelineTab />
            <JiraIssuesTab />
            <SettingsTab />
          </TransitionPanel>
        </main>
      </div>

      <Dialog
        open={!!selectedIssueKey}
        onOpenChange={(open) => !open && setSelectedIssueKey(null)}
      >
        <DialogContent
          className="p-0 border-0 shadow-none gap-0 mx-auto max-w-md"
          showCloseButton
        >
          {issueQuery.data && (
            <JiraIssueCard
              issue={issueQuery.data}
              defaultExpanded
              collapsible={false}
              onOpenInJira={(key) => window.electron.openJiraExternal(key)}
              onTrackTime={async (key) => {
                await startTracking.mutateAsync(key);
                setSelectedIssueKey(null);
                setSelectedTimeEntry(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
