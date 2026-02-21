---
title: "shadcn/ui Setup and Configuration"
source:
  - url: "https://ui.shadcn.com/docs/cli"
    title: "shadcn CLI Reference"
  - url: "https://ui.shadcn.com/docs/components-json"
    title: "components.json Configuration"
  - url: "https://ui.shadcn.com/docs/installation/vite"
    title: "Installation — Vite"
  - url: "https://ui.shadcn.com/docs/installation/manual"
    title: "Installation — Manual"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn-ui, setup, configuration, cli, vite, tailwindcss]
---

# shadcn/ui Setup and Configuration

## Overview

shadcn/ui is installed via its CLI (`shadcn`), which scaffolds a `components.json` config file and copies component source files directly into your project. Configuration is primarily managed through `components.json`, which controls path aliases, styling preferences, and Tailwind integration. This file covers CLI usage, the `components.json` schema, and installation for Vite (our stack), plus links to other framework guides.

---

## CLI Commands

All CLI commands are run via `pnpm dlx shadcn@latest <command>` (no global install required).

### `init`

Initializes a new project: installs dependencies, writes `components.json`, and sets up base CSS variables.

```bash
pnpm dlx shadcn@latest init
```

| Flag | Description |
|------|-------------|
| `-t, --template <template>` | Template (`next`, `next-monorepo`) |
| `-b, --base-color <color>` | Base palette: `neutral`, `gray`, `zinc`, `stone`, `slate` |
| `-y, --yes` | Skip confirmation prompts (default: `true`) |
| `-f, --force` | Overwrite existing configuration |
| `-c, --cwd <path>` | Working directory (defaults to current) |
| `-s, --silent` | Suppress output |
| `--src-dir` / `--no-src-dir` | Use or skip `src/` directory layout |
| `--css-variables` / `--no-css-variables` | Enable/disable CSS variable theming |
| `--no-base-style` | Skip base style installation |

### `add`

Adds one or more components (and their dependencies) to your project. Copies source files into the configured `components` path.

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add button card dialog
pnpm dlx shadcn@latest add --all   # Add every available component
```

| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip confirmation (default: `false`) |
| `-o, --overwrite` | Overwrite existing files |
| `-a, --all` | Add all available components |
| `-p, --path <path>` | Override destination path |
| `-c, --cwd <path>` | Working directory |
| `-s, --silent` | Suppress output |
| `--src-dir` / `--no-src-dir` | Directory layout preference |
| `--css-variables` / `--no-css-variables` | CSS variable preference |

### `view`

Displays registry item details before installation — useful for inspecting what a component includes.

```bash
pnpm dlx shadcn@latest view button
pnpm dlx shadcn@latest view @acme/auth @v0/dashboard
```

### `search` / `list`

Searches registries for available components.

```bash
pnpm dlx shadcn@latest search @shadcn -q "button"
pnpm dlx shadcn@latest search @shadcn @v0 @acme
pnpm dlx shadcn@latest list @acme          # Alias for search
```

| Flag | Description |
|------|-------------|
| `-q, --query <query>` | Search string |
| `-l, --limit <n>` | Max results (default: 100) |
| `-o, --offset <n>` | Pagination offset (default: 0) |

### `build`

Generates registry JSON files for publishing a custom component registry.

```bash
pnpm dlx shadcn@latest build
pnpm dlx shadcn@latest build --output ./public/registry
```

### `migrate`

Applies code transformations to your project components.

```bash
pnpm dlx shadcn@latest migrate icons          # Switch icon libraries
pnpm dlx shadcn@latest migrate radix          # Migrate to unified radix-ui package
pnpm dlx shadcn@latest migrate rtl            # Enable right-to-left support
pnpm dlx shadcn@latest migrate --list         # List all available migrations
pnpm dlx shadcn@latest migrate radix src/components/ui/button.tsx
pnpm dlx shadcn@latest migrate rtl "src/components/ui/**"
```

---

## `components.json` Configuration

`components.json` is placed at the project root after running `shadcn init`. It controls how the CLI generates and places components.

Full schema: `https://ui.shadcn.com/schema.json`

### Style

```json
{ "style": "new-york" }
```

- Only value in active use: `"new-york"` (`"default"` is deprecated)
- **Cannot be changed after initialization**

### Tailwind Settings

```json
{
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  }
}
```

| Key | Description |
|-----|-------------|
| `config` | Path to `tailwind.config.js/ts`. Leave blank for Tailwind CSS v4. |
| `css` | Path to the CSS file that imports Tailwind |
| `baseColor` | Default palette: `gray`, `neutral`, `slate`, `stone`, `zinc`. **Immutable post-init.** |
| `cssVariables` | `true` = CSS variable theming; `false` = Tailwind utility classes. **Immutable post-init.** |
| `prefix` | Prefix added to all Tailwind utilities in components (e.g., `"tw-"`) |

### React Server Components

```json
{ "rsc": false }
```

When `true`, the CLI automatically adds `"use client"` directives to client components. Set to `false` for Vite/non-Next.js projects.

### TypeScript / JavaScript

```json
{ "tsx": true }
```

- `true` — generate `.tsx` files (TypeScript)
- `false` — generate `.jsx` files (JavaScript)

### Path Aliases

These must match the `paths` configured in `tsconfig.json` / `jsconfig.json`.

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

| Alias | Purpose |
|-------|---------|
| `components` | Where component files are placed |
| `utils` | Location of the `cn()` utility function |
| `ui` | Subdirectory for shadcn UI primitives |
| `lib` | Library/helper functions |
| `hooks` | Custom React hooks |

### Custom Registries

For third-party or private registries (e.g., v0, internal design systems):

```json
{
  "registries": {
    "acme": {
      "url": "https://acme.com/r/[name]",
      "headers": {
        "Authorization": "Bearer ${ACME_TOKEN}"
      }
    }
  }
}
```

Environment variables in headers are expanded at runtime using `${VAR_NAME}` syntax.

### Full Example (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Installation: Vite (Primary)

This project uses Vite + React + TypeScript. Follow these steps to set up shadcn/ui.

### 1. Create a Vite project

```bash
pnpm create vite@latest
# Select: React, TypeScript
```

### 2. Add Tailwind CSS v4

```bash
pnpm add tailwindcss @tailwindcss/vite
```

Replace `src/index.css` contents:

```css
@import "tailwindcss";
```

### 3. Configure TypeScript path aliases

Update `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Apply the same `baseUrl` and `paths` in `tsconfig.app.json`.

### 4. Update `vite.config.ts`

```bash
pnpm add -D @types/node
```

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 5. Initialize shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

The CLI will prompt for a base color, then write `components.json` and inject CSS variables.

### 6. Add components

```bash
pnpm dlx shadcn@latest add button
```

```typescript
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
    </div>
  )
}

export default App
```

---

## Installation: Manual (Without CLI)

Use this approach when the CLI cannot be run (e.g., monorepo path constraints, restricted environments).

### 1. Set up Tailwind CSS

Follow [tailwindcss.com/docs/installation](https://tailwindcss.com/docs/installation).

### 2. Install dependencies

```bash
pnpm add shadcn class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
```

| Package | Purpose |
|---------|---------|
| `shadcn` | Core CLI/runtime |
| `class-variance-authority` | Variant-based class management (`cva`) |
| `clsx` | Conditional class merging |
| `tailwind-merge` | Resolves Tailwind class conflicts |
| `lucide-react` | Default icon library |
| `tw-animate-css` | Animation utilities |

### 3. Configure path aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 4. Add CSS variables

Add shadcn theme variables to your global CSS file. See [ui.shadcn.com/docs/installation/manual](https://ui.shadcn.com/docs/installation/manual) for the full OKLch color definitions for light/dark modes.

### 5. Create the `cn` utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 6. Create `components.json`

Add a `components.json` at the project root (see [Full Example](#full-example-componentsjson) above).

### 7. Copy component files manually

After setup, copy individual component files from [ui.shadcn.com](https://ui.shadcn.com) or use `shadcn add` to install components into the correct alias paths.

---

## Framework Installation Guides

shadcn/ui has framework-specific guides for path alias and Tailwind setup differences. This project uses Vite (see above); other guides:

| Framework | Guide |
|-----------|-------|
| Next.js | [ui.shadcn.com/docs/installation/next](https://ui.shadcn.com/docs/installation/next) |
| Remix | [ui.shadcn.com/docs/installation/remix](https://ui.shadcn.com/docs/installation/remix) |
| Astro | [ui.shadcn.com/docs/installation/astro](https://ui.shadcn.com/docs/installation/astro) |
| Laravel | [ui.shadcn.com/docs/installation/laravel](https://ui.shadcn.com/docs/installation/laravel) |
| Gatsby | [ui.shadcn.com/docs/installation/gatsby](https://ui.shadcn.com/docs/installation/gatsby) |
| React Router | [ui.shadcn.com/docs/installation/react-router](https://ui.shadcn.com/docs/installation/react-router) |
| TanStack Router | [ui.shadcn.com/docs/installation/tanstack](https://ui.shadcn.com/docs/installation/tanstack) |
| TanStack Start | [ui.shadcn.com/docs/installation/tanstack-start](https://ui.shadcn.com/docs/installation/tanstack-start) |

> Content and steps differ between frameworks primarily in how path aliases, Tailwind plugins, and CSS entry points are configured.
