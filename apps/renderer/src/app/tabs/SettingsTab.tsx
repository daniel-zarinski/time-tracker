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
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

const JIRA_TOAST_ID = 'jira-settings';

export function SettingsTab() {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    window.electron.store
      .getJiraConfig()
      .then((config) => {
        if (config) {
          setEmail(config.email);
          setDomain(config.domain);
          setToken(config.token);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim() || !email || !token) return;
    setIsSaving(true);
    try {
      await window.electron.store.setJiraConfig({ domain, email, token });
      toast.success('Settings saved', { id: JIRA_TOAST_ID });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTestConnection() {
    if (!domain.trim() || !email || !token) return;
    setIsTesting(true);
    try {
      await toast
        .promise(
          window.electron.jira.testConnection({ domain, email, token }),
          {
            id: JIRA_TOAST_ID,
            loading: 'Testing connection…',
            success: 'Connected',
            error: 'Connection failed',
          }
        )
        .unwrap();
    } finally {
      setIsTesting(false);
    }
  }

  if (isLoading) {
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
                  <Button type="submit" disabled={isSaving}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isTesting}
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
    </div>
  );
}
