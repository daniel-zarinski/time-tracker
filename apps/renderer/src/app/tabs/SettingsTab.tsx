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
import { Database, FolderOpen, Globe, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const JIRA_TOAST_ID = 'jira-settings';

export function SettingsTab() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');

  const configQuery = useQuery({
    queryKey: ['jira', 'config'],
    queryFn: () => window.store.getJiraConfig(),
  });
  const dbPathQuery = useQuery({
    queryKey: ['database', 'path'],
    queryFn: () => window.database.getPath(),
  });

  const saveMutation = useMutation({
    mutationFn: (config: { domain: string; email: string; token: string }) =>
      window.store.setJiraConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jira', 'config'] });
      toast.success('Settings saved', { id: JIRA_TOAST_ID });
    },
  });

  const testMutation = useMutation({
    mutationFn: (config: { domain: string; email: string; token: string }) =>
      window.jira.testConnection(config),
  });

  const fetchMissingIssuesMutation = useMutation({
    mutationFn: () => window.jira.fetchMissingIssues(),
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

  if (configQuery.isLoading) {
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
                Fetch issues from Jira that are not yet in your local database.
              </FieldDescription>
              <Field orientation="horizontal">
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={() => fetchMissingIssuesMutation.mutateAsync()}
                  disabled={fetchMissingIssuesMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {fetchMissingIssuesMutation.isPending
                    ? 'Syncing…'
                    : 'Sync missing issues'}
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
