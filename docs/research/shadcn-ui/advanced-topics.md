---
title: "shadcn/ui — Advanced Topics: Monorepo, React 19, Registry, and MCP"
source:
  - url: "https://ui.shadcn.com/docs/monorepo"
    title: "Monorepo — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/react-19"
    title: "React 19 — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/registry/getting-started"
    title: "Registry: Getting Started — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/mcp"
    title: "MCP Server — shadcn/ui"
  - url: "https://pustelto.com/blog/adding-shadcnui-to-nx-monorepo/"
    title: "Adding shadcn/ui to an Nx Monorepo — Tomas Pustelnik"
  - url: "https://medium.com/@sakshijaiswal0310/building-a-scalable-react-monorepo-with-nx-and-shadcn-ui-a-complete-implementation-guide-96c2bb1b42e8"
    title: "Building a Scalable React Monorepo with NX and Shadcn/UI — Medium"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn-ui, monorepo, nx, react-19, registry, mcp]
---

# shadcn/ui — Advanced Topics

## Overview

This document covers advanced shadcn/ui usage: monorepo integration (including Nx-specific setup), React 19 compatibility, the custom registry system, and the MCP server for AI assistant integration. For basic installation and theming, see `setup-and-configuration.md` and `theming-and-styling.md`.

---

## Monorepo Setup

### Official Monorepo Model (Turborepo)

The official shadcn/ui monorepo documentation targets Turborepo, but the same principles apply to Nx workspaces. The model is:

- A **shared UI package** (`packages/ui` / `libs/ui`) holds all shadcn/ui components
- Each **application** references the shared package via TypeScript path aliases
- Each workspace has its own `components.json`

**Recommended directory structure:**

```
apps/
  renderer/           # Your Electron React app
    components.json   # App-level shadcn config
    package.json
libs/
  ui/                 # Shared component library
    src/
      components/     # shadcn/ui components live here
      hooks/
      lib/
      styles/
        globals.css
    components.json   # Library-level shadcn config
    package.json
tsconfig.base.json    # Nx root TS config with path aliases
```

### Nx-Specific Setup

Nx differs from Turborepo in several ways that require extra steps.

#### 1. Generate the shared UI library

```bash
npx nx g @nx/react:library ui --directory libs/ui --bundler vite
```

#### 2. Configure TypeScript path aliases in `tsconfig.base.json`

Use a path pattern that allows importing individual components (avoids importing the whole library):

```json
{
  "compilerOptions": {
    "paths": {
      "@my-app/ui": ["libs/ui/src/index.ts"],
      "@my-app/ui/*": ["libs/ui/src/*"]
    }
  }
}
```

This enables per-component imports:

```typescript
import { Button } from "@my-app/ui/components/button";
import { cn } from "@my-app/ui/lib/utils";
```

#### 3. Create `components.json` at the monorepo root

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "libs/ui/src/styles/globals.css"
  },
  "aliases": {
    "components": "@my-app/ui/components",
    "ui": "@my-app/ui/components",
    "utils": "@my-app/ui/lib/utils",
    "hooks": "@my-app/ui/hooks",
    "lib": "@my-app/ui/lib"
  }
}
```

> **Tailwind CSS v4:** Leave the `tailwind.config` field empty — v4 doesn't use a config file.

#### 4. Per-app `components.json` (optional)

If individual apps need local component overrides, add a `components.json` in each app pointing back to the shared library for `utils`:

```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@my-app/ui/components",
    "utils": "@my-app/ui/lib/utils"
  }
}
```

**Critical:** `style`, `iconLibrary`, and `baseColor` must be identical across all `components.json` files in the workspace.

#### 5. Adding components in Nx

Because Nx uses `tsconfig.base.json` rather than a root `tsconfig.json`, you must explicitly point the CLI to the correct TypeScript config:

```bash
TS_NODE_PROJECT=tsconfig.base.json npx shadcn@latest add button
```

Or from inside the app directory:

```bash
cd apps/renderer
npx shadcn@latest add button
```

### Nx Relevance for This Project

This project uses Nx with:
- `apps/renderer` — React frontend (the Electron renderer)
- `apps/desktop` — Electron main process

To share shadcn/ui components between potential future apps, generate `libs/ui` and configure the path aliases as described above. For a single-app setup, installing directly into `apps/renderer/src/components/ui` is simpler.

---

## React 19 Compatibility

shadcn/ui fully supports React 19 as of 2025. Most dependencies have been updated:

| Package | Status |
|---------|--------|
| Radix UI | ✅ React 19 supported |
| Lucide React | ✅ React 19 supported |
| React Hook Form | ✅ React 19 supported |
| Sonner | ✅ React 19 supported |
| Recharts | ⚠️ Requires `react-is` override |

**This project uses React 19.** No special flags should be required for most components. If `npm install` fails with peer dependency errors for a specific component dependency, use:

```bash
npm install <package> --legacy-peer-deps
```

> The official docs note that the React 19 guide "might be outdated — proceed with caution" and recommend thorough testing after installing new dependencies.

---

## Registry System

The shadcn/ui registry is a **code distribution platform** — it defines a schema for components and a CLI to install them. You can create private registries to share components across teams without publishing to npm.

### How It Works

1. Components are defined in `registry.json` with metadata (name, type, files, dependencies)
2. The CLI fetches component JSON from the registry URL and writes source files into your project
3. No runtime dependency is created — it's pure code copying

### Creating a Custom Registry

**Project structure:**

```
registry/
  new-york/
    my-component/
      my-component.tsx
registry.json         # Registry manifest
public/r/             # Built output (served as JSON)
```

**`registry.json` example:**

```json
{
  "name": "my-registry",
  "homepage": "https://my-company.com",
  "items": [
    {
      "name": "my-component",
      "type": "registry:ui",
      "title": "My Component",
      "description": "A custom component for our design system",
      "files": [
        {
          "path": "registry/new-york/my-component/my-component.tsx",
          "type": "registry:component"
        }
      ],
      "dependencies": ["some-package"],
      "registryDependencies": ["button"]
    }
  ]
}
```

**Build and serve:**

```bash
npx shadcn build        # Generates public/r/*.json
npx shadcn serve        # Dev server for registry
```

**Install from a custom registry:**

```bash
npx shadcn@latest add https://my-company.com/r/my-component.json
```

### Registry Best Practices

- List all shadcn/ui component dependencies in `registryDependencies` (by name, e.g. `"button"`)
- Include npm package dependencies in `dependencies` with optional version pins
- Use `@/registry` for all internal imports
- Write descriptive names and descriptions — LLMs use these to understand component purpose

See the official docs for [registry examples](https://ui.shadcn.com/docs/registry/examples), [FAQ](https://ui.shadcn.com/docs/registry/faq), and [authentication](https://ui.shadcn.com/docs/registry/authentication).

---

## MCP Server

The shadcn/ui MCP (Model Context Protocol) server lets AI assistants browse, search, and install components from registries using natural language.

### Setup

Run this command to initialize the MCP server for Claude Code:

```bash
npx shadcn@latest mcp init --client claude
```

Or manually add to `.mcp.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

### Capabilities

Once configured, you can ask Claude:
- "Show me all available shadcn/ui components"
- "Add a login form using shadcn/ui components"
- "Install the data table component"

The MCP server works with public registries, private company registries, and namespaced registries. Full documentation: [ui.shadcn.com/docs/mcp](https://ui.shadcn.com/docs/mcp).

---

## Other Resources

| Topic | Link |
|-------|------|
| Figma integration | [ui.shadcn.com/docs/figma](https://ui.shadcn.com/docs/figma) |
| v0 (AI UI generator) | [ui.shadcn.com/docs/v0](https://ui.shadcn.com/docs/v0) |
| JavaScript (no TypeScript) | [ui.shadcn.com/docs/javascript](https://ui.shadcn.com/docs/javascript) |
| Registry examples | [ui.shadcn.com/docs/registry/examples](https://ui.shadcn.com/docs/registry/examples) |
| Registry FAQ | [ui.shadcn.com/docs/registry/faq](https://ui.shadcn.com/docs/registry/faq) |
