---
title: "shadcn/ui Theming and Styling"
source:
  - url: "https://ui.shadcn.com/docs/theming"
    title: "Theming — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/dark-mode"
    title: "Dark Mode — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/dark-mode/vite"
    title: "Dark Mode: Vite — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/tailwind-v4"
    title: "Tailwind CSS v4 — shadcn/ui"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn-ui, theming, dark-mode, tailwind-css, css-variables, oklch]
---

# shadcn/ui Theming and Styling

## Overview

shadcn/ui uses CSS custom properties (variables) mapped to Tailwind utility classes to power its theming system. Components reference semantic tokens (e.g., `--primary`, `--background`) rather than raw color values, making it straightforward to swap palettes or add dark mode without touching component code. Tailwind CSS v4 is fully supported, with OKLCH color values and the `@theme inline` directive replacing the older HSL-based approach.

## Theming System

### Two Approaches

shadcn/ui supports two theming strategies, selected at init time via `tailwind.cssVariables` in `components.json`:

| Strategy | `cssVariables` | Usage |
|---|---|---|
| CSS variables (recommended) | `true` | `bg-primary text-primary-foreground` |
| Utility classes | `false` | `bg-zinc-900 text-zinc-50` |

The CSS variable approach is preferred because it enables runtime theme switching (e.g., dark mode) without rebuilding styles.

### Semantic Color Tokens

The naming convention pairs each color with a `-foreground` variant for text on that surface:

```css
/* background = surface color, foreground = text on that surface */
.bg-primary          /* uses var(--primary) */
.text-primary-foreground  /* uses var(--primary-foreground) */
```

Available token pairs:

| Token | Purpose |
|---|---|
| `background` / `foreground` | Page background and default text |
| `card` / `card-foreground` | Card surfaces |
| `popover` / `popover-foreground` | Popover/dropdown surfaces |
| `primary` / `primary-foreground` | Primary actions and accents |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | Subtle backgrounds and helper text |
| `accent` / `accent-foreground` | Hover/focus highlights |
| `destructive` / `destructive-foreground` | Error/danger states |
| `border` | Borders and dividers |
| `input` | Input field borders |
| `ring` | Focus rings |
| `chart-1` … `chart-5` | Chart color series |

A `--radius` variable controls component border radius globally.

### Sidebar Color System

A dedicated set of sidebar tokens mirrors the main palette:

```
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

### Base Color Palettes

Pre-configured neutral base palettes (in OKLCH format for Tailwind v4):

- **Neutral**
- **Stone**
- **Zinc**
- **Gray**
- **Slate**

Each palette ships with optimized light and dark mode values. Pick one during `npx shadcn init` or replace the CSS variables manually.

### Adding Custom Colors

To extend the palette with a new semantic token:

```css
/* globals.css */
@layer base {
  :root {
    --warning: oklch(0.84 0.16 84);
    --warning-foreground: oklch(0.28 0.07 46);
  }

  .dark {
    --warning: oklch(0.70 0.18 84);
    --warning-foreground: oklch(0.95 0.02 84);
  }
}

/* Expose as Tailwind utility via @theme inline */
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

Then use it like any other token:

```tsx
<div className="bg-warning text-warning-foreground">
  This is a warning
</div>
```

## Dark Mode

### How It Works

Dark mode is implemented via a `.dark` class on `document.documentElement`. CSS variable values are redefined inside `.dark { … }` selectors, so the entire color system flips automatically.

Theme detection follows a priority chain:

1. `localStorage` — check for a saved user preference
2. `window.matchMedia('(prefers-color-scheme: dark)')` — fall back to OS preference
3. Apply the resulting class to `<html>` **before** React hydrates — prevents flash-of-wrong-theme (FOWT)

### Framework-Specific Guides

| Framework | Guide |
|---|---|
| Vite | See detailed steps below |
| Next.js | https://ui.shadcn.com/docs/dark-mode/next |
| Astro | https://ui.shadcn.com/docs/dark-mode/astro |
| Remix | https://ui.shadcn.com/docs/dark-mode/remix |

## Dark Mode: Vite Implementation

This project uses Electron + Vite (renderer app), making the Vite guide the closest match.

### Step 1 — Create a ThemeProvider

Create `src/components/theme-provider.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
```

### Step 2 — Wrap the App Root

In `src/app/app.tsx` (or equivalent root component):

```tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {/* rest of your app */}
    </ThemeProvider>
  )
}
```

### Step 3 — Add a Mode Toggle Component

Create `src/components/mode-toggle.tsx` using shadcn/ui's `Button` and `DropdownMenu` components plus `lucide-react` icons:

```tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Tailwind CSS v4 Integration

### What Changed

shadcn/ui fully supports Tailwind CSS v4, with several breaking changes addressed:

| Change | v3 | v4 |
|---|---|---|
| Color format | HSL | OKLCH |
| Theme config | `tailwind.config.js` | CSS `@theme` directive |
| Animation lib | `tailwindcss-animate` | `tw-animate-css` |
| Default style | `default` | `new-york` |
| Toast component | `toast` | `sonner` |
| Button cursor | pointer | default |
| `forwardRef` | required for components | removed; use `data-slot` |

### Migrating Existing Projects to Tailwind v4

1. **Run the Tailwind upgrade codemod:**

   ```bash
   npx @tailwindcss/upgrade@next
   ```

2. **Update CSS variable placement** — move `:root` and `.dark` blocks outside `@layer base`, wrap colors in `hsl()` (or switch to OKLCH), and use `@theme inline`:

   ```css
   /* Before (v3) */
   @layer base {
     :root {
       --primary: 222.2 47.4% 11.2%;
     }
   }

   /* After (v4) */
   :root {
     --primary: oklch(0.21 0.034 264.5);
   }

   @theme inline {
     --color-primary: var(--primary);
   }
   ```

3. **Update chart colors** — remove `hsl()` wrappers from `chartConfig` objects since OKLCH values are used directly.

4. **Replace size utilities** — use `size-*` instead of paired `w-* h-*` where applicable.

5. **Remove `forwardRef`** — use the React codemod or manually convert components to named functions with `data-slot` attributes.

6. **Update dark mode OKLCH values** if you have customized the dark palette.

### Browser Compatibility

Tailwind v4 targets modern browsers only (uses bleeding-edge CSS features). Verify your target browser support before migrating.

### Non-Breaking Upgrade Path

Existing Tailwind v3 + React 18 projects continue working. New components added to an unupgraded project stay v3-compatible until you explicitly upgrade.

## CSS Variable Reference (Tailwind v4 Format)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* … remaining dark values … */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* … remaining mappings … */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```
