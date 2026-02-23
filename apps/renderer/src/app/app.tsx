import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
} from '@time-tracker/ui';

import { HomeTab, SettingsTab, JiraIssuesTab } from './tabs';
import { useAppStore, TabValue } from './store';

export function App() {
  const activeTab = useAppStore.use.activeTab();
  const setActiveTab = useAppStore.use.setActiveTab();

  return (
    <div
      className="min-h-screen text-foreground"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <header className="flex items-center justify-center pt-2">
          <TabsList
            className="gap-2"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="jira-issues">Jira Issues</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
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
