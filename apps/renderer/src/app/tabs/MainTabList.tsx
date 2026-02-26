import { TabsList, TabsTrigger } from '@time-tracker/ui';

export function MainTabList() {
  return (
    <TabsList
      className="gap-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <TabsTrigger value="home">Home</TabsTrigger>
      <TabsTrigger value="tasks">Tasks</TabsTrigger>
      <TabsTrigger value="timeline">Time Entries</TabsTrigger>
      <TabsTrigger value="jira-issues">Jira Issues</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
  );
}
