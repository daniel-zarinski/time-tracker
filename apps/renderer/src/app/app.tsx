import * as React from 'react';
import { Search } from 'lucide-react';

import {
  Button,
  CommandPalette,
  Dialog,
  DialogContent,
  Tabs,
  TabsContent,
  toast,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import type { JiraIssueWithParent } from '@time-tracker/database';

import {
  HomeTab,
  TasksTab,
  SettingsTab,
  JiraIssuesTab,
  MainTabList,
} from './tabs';
import { useAppStore, TabValue } from './store';
import { useAppCommands } from './use-app-commands';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TimelineTab } from './tabs/timeline';
import { JiraIssueCard } from './components/cards/jira-issue-card';
import { TimeEntryCardDefault } from './components/cards/time-entry-card-default';

export function App() {
  const queryClient = useQueryClient();
  const activeTab = useAppStore.use.activeTab();
  const setActiveTab = useAppStore.use.setActiveTab();
  const selectedIssueKey = useAppStore.use.selectedIssueKey();
  const setSelectedIssueKey = useAppStore.use.setSelectedIssueKey();
  const selectedTimeEntry = useAppStore.use.selectedTimeEntry();
  const selectedTimeEntryView = useAppStore.use.selectedTimeEntryView();
  const setSelectedTimeEntry = useAppStore.use.setSelectedTimeEntry();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { commands } = useAppCommands();

  const { data: jiraIssues = [] } = useQuery({
    queryKey: ['jira', 'my-issues'],
    queryFn: () => window.database.getMyJiraIssues(),
    retry: false,
  });

  const issueQuery = useQuery<JiraIssueWithParent | null>({
    queryKey: ['jira-issue', selectedIssueKey],
    queryFn: () => window.database.getJiraIssueByKey(selectedIssueKey!),
    enabled: !!selectedIssueKey,
  });

  const issueItems: ComboboxSelectItem[] = React.useMemo(
    () =>
      jiraIssues
        .filter((i) => i.key != null)
        .map((i) => ({
          value: i.key!,
          label: i.key!,
          description: i.summary ?? undefined,
        })),
    [jiraIssues]
  );
  const startTrackingMutation = useMutation({
    mutationFn: (key: string) => window.timeTracking.startTracking(key),
    onSuccess: () => {
      setSelectedIssueKey(null);
      setSelectedTimeEntry(null);
    },
    onError: () => {
      toast.error('Failed to start time entry', { position: 'bottom-center' });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: (entryId: string) => window.database.deleteTimeEntry(entryId),
    onSuccess: () => {
      setSelectedTimeEntry(null);
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] });
      toast.success('Time entry deleted');
    },
    onError: () => {
      toast.error('Failed to delete time entry', { position: 'bottom-center' });
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: {
        startedAt?: Date;
        timeSpentSeconds?: number;
        description?: string;
      };
    }) => window.database.updateTimeEntry(entryId, updates),
    onSuccess: () => {
      setSelectedTimeEntry(null);
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['active-time-entry'] });
      toast.success('Time entry updated');
    },
    onError: () => {
      toast.error('Failed to update time entry', { position: 'bottom-center' });
    },
  });

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
            <HomeTab />
          </TabsContent>

          <TabsContent value="tasks" className="overflow-y-auto">
            <TasksTab />
          </TabsContent>

          <TabsContent value="timeline" className="overflow-y-auto">
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
                await startTrackingMutation.mutateAsync(key);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedTimeEntry}
        onOpenChange={(open) => !open && setSelectedTimeEntry(null)}
      >
        <DialogContent
          className="p-0 border-0 shadow-none gap-0 mx-auto max-w-md"
          showCloseButton
        >
          {selectedTimeEntry && (
            <TimeEntryCardDefault
              entry={selectedTimeEntry}
              issues={issueItems}
              defaultExpanded
              defaultView={selectedTimeEntryView}
              onResumeTimer={async (key) => {
                await startTrackingMutation.mutateAsync(key);
              }}
              onOpenInJira={(key) => window.electron.openJiraExternal(key)}
              onSave={async (entryId, updates) => {
                await updateTimeEntryMutation.mutateAsync({
                  entryId,
                  updates: {
                    startedAt: updates.startedAt,
                    timeSpentSeconds: updates.timeSpentSeconds,
                    description: updates.description,
                    // issueKey: updates.issueKey,
                  },
                });
              }}
              onDelete={async (id) => {
                await deleteTimeEntryMutation.mutateAsync(id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
