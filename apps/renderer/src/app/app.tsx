import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
} from '@time-tracker/ui';

import { HomeTab, SettingsTab, TasksTab } from './tabs';
import { useAppStore, TabValue } from './store';

export function App() {
  const activeTab = useAppStore.use.activeTab();
  const setActiveTab = useAppStore.use.setActiveTab();

  return (
    <div className="min-h-screen text-foreground">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <header className="flex items-center justify-center pt-2">
          <TabsList className="gap-2">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </header>
        <Separator />
        <main className="mx-auto max-w-7xl px-4">
          <TabsContent value="home">
            <HomeTab />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTab />
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
