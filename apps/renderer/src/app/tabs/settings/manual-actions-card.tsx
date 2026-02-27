import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
  Field,
} from '@time-tracker/ui';
import {
  useJiraSyncMutations,
  useTempoSyncMutations,
} from '@time-tracker/hooks';
import { RefreshCw } from 'lucide-react';

export function ManualActionsCard() {
  const { fetchAllMyIssues, fetchMissingIssues, syncStatuses } =
    useJiraSyncMutations();
  const { syncWorklogs } = useTempoSyncMutations();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <RefreshCw className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Manual actions
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Run sync and maintenance tasks on demand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet className="gap-3">
            <FieldLegend>Sync Jira</FieldLegend>
            <FieldDescription>
              Fetch issues from Jira. Use &quot;Sync all my issues&quot; to
              import everything assigned to you, or &quot;Sync missing
              issues&quot; to fetch only issues referenced in worklogs but not
              yet in your database.
            </FieldDescription>
            <Field orientation="horizontal" className="flex-wrap gap-2">
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => fetchAllMyIssues.mutate()}
                disabled={fetchAllMyIssues.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {fetchAllMyIssues.isPending
                  ? 'Syncing…'
                  : 'Sync all my issues'}
              </Button>
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => fetchMissingIssues.mutate()}
                disabled={fetchMissingIssues.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {fetchMissingIssues.isPending
                  ? 'Syncing…'
                  : 'Sync missing issues'}
              </Button>
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => syncStatuses.mutate()}
                disabled={syncStatuses.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {syncStatuses.isPending
                  ? 'Syncing…'
                  : 'Sync statuses'}
              </Button>
            </Field>
          </FieldSet>
          <FieldSet className="gap-3">
            <FieldLegend>Sync Tempo</FieldLegend>
            <FieldDescription>
              Fetch worklogs from Tempo for the last 30 days and upsert into
              your local database. Requires Jira to be configured (Tempo API
              v4 returns issue IDs only).
            </FieldDescription>
            <Field orientation="horizontal">
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => syncWorklogs.mutate()}
                disabled={syncWorklogs.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {syncWorklogs.isPending
                  ? 'Syncing…'
                  : 'Sync worklogs'}
              </Button>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
