import * as React from 'react';
import { Search } from 'lucide-react';

import {
  Button,
  CommandPalette,
  Dialog,
  DialogContent,
  JiraIssueCard,
  Tabs,
  TabsContent,
  Separator,
  toast,
} from '@time-tracker/ui';

import { TasksTab, SettingsTab, JiraIssuesTab, MainTabList } from './tabs';
import { useAppStore, TabValue } from './store';
import { useAppCommands } from './use-app-commands';
import { useMutation } from '@tanstack/react-query';
import { TimelineTab } from './tabs/TimelineTab';

export function App() {
  const activeTab = useAppStore.use.activeTab();
  const setActiveTab = useAppStore.use.setActiveTab();
  const selectedIssue = useAppStore.use.selectedIssue();
  const setSelectedIssue = useAppStore.use.setSelectedIssue();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { commands } = useAppCommands();
  const startTrackingMutation = useMutation({
    mutationFn: (key: string) => window.timeTracking.startTracking(key),
    onSuccess: () => {
      setSelectedIssue(null);
    },
    onError: () => {
      toast.error('Failed to start time entry', { position: 'bottom-center' });
    },
  });

  return (
    <div className="min-h-screen text-foreground">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <header
          className="flex items-center justify-between pt-2"
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

        <Separator />

        <main style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <TabsContent value="tasks">
            <TasksTab />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab />
          </TabsContent>

          <TabsContent value="jira-issues">
            <JiraIssuesTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </main>
      </Tabs>

      <Dialog
        open={!!selectedIssue}
        onOpenChange={(open) => !open && setSelectedIssue(null)}
      >
        <DialogContent
          className="p-0 border-0 shadow-none gap-0 mx-auto max-w-md"
          showCloseButton
        >
          {selectedIssue && (
            <JiraIssueCard
              issue={selectedIssue}
              defaultExpanded
              collapsible={false}
              onOpenInJira={(key) => window.electron.openJiraExternal(key)}
              onTrackTime={async (key) => {
                await startTrackingMutation.mutateAsync(key);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
