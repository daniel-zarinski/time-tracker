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
  RadioGroup,
  RadioGroupItem,
  Label,
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
            <Field>
              <FieldLabel>Theme</FieldLabel>
              <RadioGroup
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as 'light' | 'dark')
                }
                className="flex flex-row gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="cursor-pointer">
                    Light
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="cursor-pointer">
                    Dark
                  </Label>
                </div>
              </RadioGroup>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
