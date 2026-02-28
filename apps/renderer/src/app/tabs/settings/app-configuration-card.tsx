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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@time-tracker/ui';
import { useThemeConfigContext } from '@time-tracker/hooks';
import { cn } from '@time-tracker/utils';
import type { AccentColor } from '@time-tracker/utils';
import { Palette, Check } from 'lucide-react';

const ACCENT_OPTIONS: { value: AccentColor | undefined; label: string; color: string }[] = [
  { value: undefined, label: 'Default', color: 'oklch(0.55 0 0)' },
  { value: 'blue', label: 'Blue', color: 'oklch(0.55 0.2 255)' },
  { value: 'purple', label: 'Purple', color: 'oklch(0.55 0.2 295)' },
  { value: 'pink', label: 'Pink', color: 'oklch(0.6 0.2 350)' },
  { value: 'red', label: 'Red', color: 'oklch(0.55 0.22 25)' },
  { value: 'orange', label: 'Orange', color: 'oklch(0.65 0.2 55)' },
  { value: 'yellow', label: 'Yellow', color: 'oklch(0.7 0.17 85)' },
  { value: 'green', label: 'Green', color: 'oklch(0.55 0.17 155)' },
  { value: 'graphite', label: 'Graphite', color: 'oklch(0.45 0.02 260)' },
];

export function AppConfigurationCard() {
  const { theme, setTheme, accentColor, setAccentColor } = useThemeConfigContext();

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
          <FieldSet className="gap-3">
            <FieldLegend>Accent Color</FieldLegend>
            <div className="flex items-center gap-2">
              {ACCENT_OPTIONS.map((option) => {
                const isSelected = accentColor === option.value;
                return (
                  <Tooltip key={option.label}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setAccentColor(option.value)}
                        className={cn(
                          'size-6 rounded-full flex items-center justify-center transition-all',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                          isSelected && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                        )}
                        style={{ backgroundColor: option.color }}
                        aria-label={option.label}
                      >
                        {isSelected && (
                          <Check
                            className="size-3.5"
                            style={{
                              color: option.value === 'yellow'
                                ? 'oklch(0.25 0.05 85)'
                                : 'white',
                            }}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{option.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
