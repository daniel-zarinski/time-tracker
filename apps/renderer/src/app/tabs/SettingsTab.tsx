import {
  Button,
  Input,
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
  FieldLabel,
  FieldSeparator,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@time-tracker/ui';
import {
  useJiraConfig,
  useTempoConfig,
  useDatabasePath,
  useJiraConfigMutations,
  useTempoConfigMutations,
  useJiraSyncMutations,
  useTempoSyncMutations,
  useDatabaseMutations,
} from '@time-tracker/hooks';
import {
  Clock,
  Database,
  FolderOpen,
  Globe,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const TEMPO_API_INTEGRATION_PATH =
  '/plugins/servlet/ac/io.tempo.jira/tempo-app#!/configuration/api-integration';
const TEMPO_HELP_URL =
  'https://help.tempo.io/planner/latest/using-rest-api-integrations';

export function SettingsTab() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [token, setToken] = useState('');
  const [tempoToken, setTempoToken] = useState('');

  const configQuery = useJiraConfig();
  const dbPathQuery = useDatabasePath();
  const tempoConfigQuery = useTempoConfig();

  const { save: saveJira, testConnection: testJiraConnection } =
    useJiraConfigMutations();
  const { save: saveTempo, testConnection: testTempoConnection } =
    useTempoConfigMutations();
  const { fetchAllMyIssues, fetchMissingIssues, syncStatuses } =
    useJiraSyncMutations();
  const { syncWorklogs } = useTempoSyncMutations();
  const { deleteDatabase } = useDatabaseMutations();

  useEffect(() => {
    const config = configQuery.data;
    if (config) {
      setEmail(config.email);
      setCompany(config.company);
      setToken(config.token);
    }
  }, [configQuery.data]);

  useEffect(() => {
    const config = tempoConfigQuery.data;
    setTempoToken(config?.token ?? '');
  }, [tempoConfigQuery.data]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !email || !token) return;
    saveJira.mutate({ company, email, token });
  }

  function handleTestConnection() {
    if (!company.trim() || !email || !token) return;
    testJiraConnection.mutate({ company, email, token });
  }

  function handleDeleteDatabase() {
    if (
      !window.confirm(
        'Delete all time entries and persisted data? This cannot be undone.'
      )
    ) {
      return;
    }
    deleteDatabase.mutate();
  }

  const dbPath = dbPathQuery.data ?? null;

  if (configQuery.isLoading || tempoConfigQuery.isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-muted-foreground text-sm">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-muted">
              <Globe className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Jira Integration
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Connect to Jira Cloud to fetch and import issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Connection</FieldLegend>

                <Field>
                  <FieldLabel htmlFor="jira-email">Jira Email</FieldLabel>
                  <Input
                    id="jira-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="jira-company">Company Domain</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="jira-company"
                      placeholder="mycompany"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>.atlassian.net</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>Your Jira Cloud subdomain</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="jira-token">API Token</FieldLabel>
                  <Input
                    id="jira-token"
                    type="password"
                    placeholder="Your Jira API token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <FieldDescription>
                    <Button
                      type="button"
                      variant="link"
                      className="inline h-auto p-0 font-normal align-baseline ml-1 text-primary underline underline-offset-4 hover:text-primary/80"
                      onClick={() =>
                        window.electron.openExternal(
                          'https://id.atlassian.com/manage-profile/security/api-tokens'
                        )
                      }
                    >
                      Generate API token
                    </Button>
                  </FieldDescription>
                </Field>

                <FieldSeparator />

                <Field orientation="horizontal">
                  <Button type="submit" disabled={saveJira.isPending}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={testJiraConnection.isPending}
                    onClick={handleTestConnection}
                  >
                    Test Connection
                  </Button>
                </Field>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-muted">
              <Clock className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Tempo Integration
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Connect to Tempo for Jira to sync worklogs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveTempo.mutate({ token: tempoToken });
            }}
          >
            <FieldGroup>
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="tempo-token">API Token</FieldLabel>
                  <Input
                    id="tempo-token"
                    type="password"
                    placeholder="Your Tempo API token"
                    value={tempoToken}
                    onChange={(e) => setTempoToken(e.target.value)}
                  />
                  <FieldDescription>
                    <Button
                      type="button"
                      variant="link"
                      className="inline h-auto p-0 font-normal align-baseline ml-1 text-primary underline underline-offset-4 hover:text-primary/80"
                      onClick={() => {
                        const co = configQuery.data?.company;
                        const url = co
                          ? `https://${co}.atlassian.net${TEMPO_API_INTEGRATION_PATH}`
                          : TEMPO_HELP_URL;
                        window.electron.openExternal(url);
                      }}
                    >
                      Generate API token
                    </Button>
                  </FieldDescription>
                </Field>
                <FieldSeparator />
                <Field orientation="horizontal">
                  <Button type="submit" disabled={saveTempo.isPending}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={testTempoConnection.isPending}
                    onClick={() => {
                      if (!tempoToken.trim()) return;
                      testTempoConnection.mutate({ token: tempoToken });
                    }}
                  >
                    Test Connection
                  </Button>
                </Field>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4">
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

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-muted">
              <Database className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Local data
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Manage data stored locally on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet className="gap-3">
              <FieldLegend>Database</FieldLegend>
              <FieldDescription>
                Time entries and other persisted data. Deleting cannot be
                undone.
              </FieldDescription>
              {dbPath && (
                <Field>
                  <FieldLabel>Location</FieldLabel>
                  <pre className="text-xs font-mono text-muted-foreground bg-muted rounded-md p-2 w-full min-w-0 max-w-full overflow-hidden break-all whitespace-pre-wrap">
                    {dbPath}
                  </pre>
                  <Field orientation="horizontal">
                    <Button
                      variant="outline"
                      type="button"
                      size="sm"
                      onClick={() => window.electron.showItemInFolder(dbPath)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Show in folder
                    </Button>
                  </Field>
                </Field>
              )}
              <Field orientation="horizontal">
                <Button
                  variant="destructive"
                  type="button"
                  size="sm"
                  disabled={deleteDatabase.isPending}
                  onClick={handleDeleteDatabase}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete database
                </Button>
              </Field>
            </FieldSet>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
