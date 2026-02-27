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
import { useJiraConfig, useJiraConfigMutations } from '@time-tracker/hooks';
import { Globe } from 'lucide-react';

export function JiraIntegrationCard() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [token, setToken] = useState('');

  const configQuery = useJiraConfig();
  const { save: saveJira, testConnection: testJiraConnection } =
    useJiraConfigMutations();

  useEffect(() => {
    const config = configQuery.data;
    if (config) {
      setEmail(config.email);
      setCompany(config.company);
      setToken(config.token);
    }
  }, [configQuery.data]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !email || !token) return;
    saveJira.mutate({ company, email, token });
  }

  function handleTestConnection() {
    if (!company.trim() || !email || !token) return;
    testJiraConnection.mutate({ company, email, token });
  }

  return (
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
  );
}
