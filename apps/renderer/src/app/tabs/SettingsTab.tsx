import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  toast,
} from '@time-tracker/ui';
import {
  Clock,
  Database,
  FolderOpen,
  Globe,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const JIRA_TOAST_ID = 'jira-settings';
const TEMPO_TOAST_ID = 'tempo-settings';

const TEMPO_API_INTEGRATION_PATH =
  '/plugins/servlet/ac/io.tempo.jira/tempo-app#!/configuration/api-integration';
const TEMPO_HELP_URL =
  'https://help.tempo.io/planner/latest/using-rest-api-integrations';

export function SettingsTab() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [tempoToken, setTempoToken] = useState('');

  const configQuery = useQuery({
    queryKey: ['jira', 'config'],
    queryFn: () => window.store.getJiraConfig(),
  });
  const dbPathQuery = useQuery({
    queryKey: ['database', 'path'],
    queryFn: () => window.database.getPath(),
  });
  const tempoConfigQuery = useQuery({
    queryKey: ['tempo', 'config'],
    queryFn: () => window.store.getTempoConfig(),
  });

  const saveMutation = useMutation({
    mutationFn: (config: { domain: string; email: string; token: string }) =>
      window.jira.saveConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jira', 'config'] });
      toast.success('Settings saved', { id: JIRA_TOAST_ID });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to save Jira settings';
      toast.error(message, { id: JIRA_TOAST_ID });
    },
  });

  const saveTempoMutation = useMutation({
    mutationFn: (config: { token: string }) =>
      window.store.setTempoConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tempo', 'config'] });
      toast.success('Settings saved', { id: TEMPO_TOAST_ID });
    },
  });

  const testMutation = useMutation({
    mutationFn: (config: { domain: string; email: string; token: string }) =>
      window.jira.testConnection(config),
  });

  const fetchMissingIssuesMutation = useMutation({
    mutationFn: () => window.jira.fetchMissingIssues(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jira'] });
      toast.success('Missing issues synced', { id: JIRA_TOAST_ID });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to sync missing issues';
      toast.error(message, { id: JIRA_TOAST_ID });
    },
  });

  const fetchAllMyIssuesMutation = useMutation({
    mutationFn: () => window.jira.fetchMyIssues(),
    onSuccess: (issues) => {
      queryClient.invalidateQueries({ queryKey: ['jira'] });
      toast.success(
        `Synced ${issues.length} issue${issues.length === 1 ? '' : 's'}`,
        { id: JIRA_TOAST_ID }
      );
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch issues';
      toast.error(message, { id: JIRA_TOAST_ID });
    },
  });

  const testTempoMutation = useMutation({
    mutationFn: (config?: { token: string }) =>
      window.tempo.testConnection(config),
  });

  const syncWorklogsMutation = useMutation({
    mutationFn: () => window.tempo.syncWorklogs(),
    onSuccess: (count) => {
      const message =
        count === 0
          ? 'No worklogs found for the last 14 days'
          : `Synced ${count} worklog${count === 1 ? '' : 's'}`;
      toast.success(message, { id: TEMPO_TOAST_ID });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to sync worklogs';
      toast.error(message, { id: TEMPO_TOAST_ID });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => window.database.delete(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['database', 'path'] });
      if (result.success) {
        toast.success('Database deleted. Restart the app to continue.', {
          id: JIRA_TOAST_ID,
          position: 'bottom-center',
        });
      } else {
        toast.error(result.error ?? 'Failed to delete database', {
          id: JIRA_TOAST_ID,
          position: 'bottom-center',
        });
      }
    },
    onError: () => {
      toast.error('Failed to delete database', {
        id: JIRA_TOAST_ID,
        position: 'bottom-center',
      });
    },
  });

  useEffect(() => {
    const config = configQuery.data;
    if (config) {
      setEmail(config.email);
      setDomain(config.domain);
      setToken(config.token);
    }
  }, [configQuery.data]);

  useEffect(() => {
    const config = tempoConfigQuery.data;
    setTempoToken(config?.token ?? '');
  }, [tempoConfigQuery.data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || !email || !token) return;
    saveMutation.mutate({ domain, email, token });
  }

  async function handleTestConnection() {
    if (!domain.trim() || !email || !token) return;
    try {
      await toast
        .promise(testMutation.mutateAsync({ domain, email, token }), {
          id: JIRA_TOAST_ID,
          loading: 'Testing connection…',
          success: 'Connected',
          error: 'Connection failed',
        })
        .unwrap();
      queryClient.invalidateQueries({ queryKey: ['jira', 'config'] });
    } catch {
      // Toast handles error display
    }
  }

  async function handleDeleteDatabase() {
    if (
      !window.confirm(
        'Delete all time entries and persisted data? This cannot be undone.'
      )
    ) {
      return;
    }
    deleteMutation.mutate();
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
                  <FieldLabel htmlFor="jira-domain">Company Domain</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="jira-domain"
                      placeholder="mycompany"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
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
                  <Button type="submit" disabled={saveMutation.isPending}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={testMutation.isPending}
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
              saveTempoMutation.mutate({ token: tempoToken });
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
                        const domain = configQuery.data?.domain;
                        const url = domain
                          ? `https://${domain}.atlassian.net${TEMPO_API_INTEGRATION_PATH}`
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
                  <Button type="submit" disabled={saveTempoMutation.isPending}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={testTempoMutation.isPending}
                    onClick={async () => {
                      if (!tempoToken.trim()) return;
                      try {
                        await toast
                          .promise(
                            testTempoMutation.mutateAsync({
                              token: tempoToken,
                            }),
                            {
                              id: TEMPO_TOAST_ID,
                              loading: 'Testing connection…',
                              success: 'Connected',
                              error: (err: Error) =>
                                err?.message ?? 'Connection failed',
                            }
                          )
                          .unwrap();
                      } catch {
                        // Toast handles error display
                      }
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
                  onClick={() => fetchAllMyIssuesMutation.mutate()}
                  disabled={fetchAllMyIssuesMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {fetchAllMyIssuesMutation.isPending
                    ? 'Syncing…'
                    : 'Sync all my issues'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={() => fetchMissingIssuesMutation.mutate()}
                  disabled={fetchMissingIssuesMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {fetchMissingIssuesMutation.isPending
                    ? 'Syncing…'
                    : 'Sync missing issues'}
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
                  onClick={async () => {
                    try {
                      await syncWorklogsMutation.mutateAsync();
                    } catch {
                      // onError handles toast
                    }
                  }}
                  disabled={syncWorklogsMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {syncWorklogsMutation.isPending
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
                  disabled={deleteMutation.isPending}
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
