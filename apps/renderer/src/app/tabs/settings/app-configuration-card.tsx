import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FieldGroup,
  FieldSet,
  FieldLegend,
  Field,
  FieldLabel,
  FieldContent,
  FieldTitle,
  FieldDescription,
  RadioGroup,
  RadioGroupItem,
} from '@time-tracker/ui';
import { useThemeConfigContext } from '@time-tracker/hooks';
import { Palette } from 'lucide-react';

export function AppConfigurationCard() {
  const { theme, setTheme } = useThemeConfigContext();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Palette className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">
            Application
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Application-specific configuration and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet className="gap-3">
            <FieldLegend>Appearance</FieldLegend>
            <RadioGroup
              value={theme}
              onValueChange={(value) =>
                setTheme(value as 'light' | 'dark')
              }
              className="flex flex-col gap-2"
            >
              <FieldLabel htmlFor="theme-light">
                <Field orientation="horizontal" className="!p-2 gap-2">
                  <FieldContent className="gap-0.5">
                    <FieldTitle className="text-xs">Light</FieldTitle>
                    <FieldDescription className="text-xs">
                      Use light theme for the interface.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="light" id="theme-light" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="theme-dark">
                <Field orientation="horizontal" className="!p-2 gap-2">
                  <FieldContent className="gap-0.5">
                    <FieldTitle className="text-xs">Dark</FieldTitle>
                    <FieldDescription className="text-xs">
                      Use dark theme for the interface.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="dark" id="theme-dark" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
