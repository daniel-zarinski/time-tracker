import * as React from 'react';
import { Search } from 'lucide-react';

import {
  Button,
  CommandPalette,
  Dialog,
  DialogContent,
  Tabs,
  TabsContent,
} from '@time-tracker/ui';
import {
  useJiraIssue,
  useTimeEntryMutations,
} from '@time-tracker/hooks';

import {
  SettingsTab,
  JiraIssuesTab,
  MainTabList,
} from './tabs';
import { useAppStore, TabValue } from './store';
import { useAppCommands } from './use-app-commands';
import { TimelineTab } from './tabs/timeline';
import { JiraIssueCard } from './components/cards/jira-issue-card';

export function App() {
  const activeTab = useAppStore.use.activeTab();
  const setActiveTab = useAppStore.use.setActiveTab();
  const selectedIssueKey = useAppStore.use.selectedIssueKey();
  const setSelectedIssueKey = useAppStore.use.setSelectedIssueKey();
  const setSelectedTimeEntry = useAppStore.use.setSelectedTimeEntry();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { commands } = useAppCommands();

  const issueQuery = useJiraIssue(selectedIssueKey);
  const { startTracking } = useTimeEntryMutations();

  return (
    <div className="flex h-screen flex-col text-foreground">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex h-full flex-col gap-0"
      >
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
          <TabsContent value="home" className="overflow-y-auto">
            <TimelineTab />
          </TabsContent>

          <TabsContent value="jira-issues" className="overflow-y-auto">
            <JiraIssuesTab />
          </TabsContent>

          <TabsContent value="settings" className="overflow-y-auto">
            <SettingsTab />
          </TabsContent>
        </main>
      </Tabs>

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
