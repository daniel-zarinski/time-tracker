import { useJiraConfig, useTempoConfig } from '@time-tracker/hooks';
import { JiraIntegrationCard } from './jira-integration-card';
import { TempoIntegrationCard } from './tempo-integration-card';
import { ManualActionsCard } from './manual-actions-card';
import { LocalDataCard } from './local-data-card';

export function SettingsTab() {
  const configQuery = useJiraConfig();
  const tempoConfigQuery = useTempoConfig();

  if (configQuery.isLoading || tempoConfigQuery.isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-muted-foreground text-sm">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-4">
      <JiraIntegrationCard />
      <TempoIntegrationCard />
      <ManualActionsCard />
      <LocalDataCard />
    </div>
  );
}
