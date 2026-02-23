import * as React from 'react';
import { Search } from 'lucide-react';

import {
  Button,
  CommandPalette,
  Tabs,
  TabsContent,
  Separator,
} from '@time-tracker/ui';

import { HomeTab, SettingsTab, JiraIssuesTab, MainTabList } from './tabs';
import { useAppStore, TabValue } from './store';
import { useAppCommands } from './use-app-commands';

export function App() {
  const activeTab = useAppStore.use.activeTab();
  const setActiveTab = useAppStore.use.setActiveTab();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { commands } = useAppCommands();

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
          <div className="flex flex-1 justify-end">
            <CommandPalette
              open={commandOpen}
              onOpenChange={setCommandOpen}
              shortcut="mod+f"
              placeholder="Type a command..."
              emptyMessage="No results found."
              trigger={
                <Button variant="ghost" size="icon" className="mr-2">
                  <Search />
                </Button>
              }
              commands={commands}
            />
          </div>
        </header>

        <Separator />

        <main style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <TabsContent value="home">
            <HomeTab />
          </TabsContent>

          <TabsContent value="jira-issues">
            <JiraIssuesTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}

export default App;
