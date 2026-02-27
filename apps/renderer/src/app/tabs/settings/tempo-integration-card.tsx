import { useEffect, useState } from 'react';
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
  FieldDescription,
  Field,
  FieldLabel,
  FieldSeparator,
} from '@time-tracker/ui';
import {
  useJiraConfig,
  useTempoConfig,
  useTempoConfigMutations,
} from '@time-tracker/hooks';
import { Clock } from 'lucide-react';

const TEMPO_API_INTEGRATION_PATH =
  '/plugins/servlet/ac/io.tempo.jira/tempo-app#!/configuration/api-integration';
const TEMPO_HELP_URL =
  'https://help.tempo.io/planner/latest/using-rest-api-integrations';

export function TempoIntegrationCard() {
  const [tempoToken, setTempoToken] = useState('');

  const configQuery = useJiraConfig();
  const tempoConfigQuery = useTempoConfig();
  const { save: saveTempo, testConnection: testTempoConnection } =
    useTempoConfigMutations();

  useEffect(() => {
    const config = tempoConfigQuery.data;
    setTempoToken(config?.token ?? '');
  }, [tempoConfigQuery.data]);

  return (
    <Card>
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
  );
}
