---
title: "Nx 22 Vite Integration and Configuration"
source:
  - url: "https://nx.dev/nx-api/vite/executors/build"
    title: "Vite Build Executor Reference"
  - url: "https://nx.dev/nx-api/vite/executors/dev-server"
    title: "Vite Dev Server Executor Reference"
  - url: "https://nx.dev/nx-api/vite/generators/configuration"
    title: "Vite Configuration Generator"
  - url: "https://vite.dev/guide/"
    title: "Vite Getting Started Guide"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, nx-22, vite, webpack, build-tools, dev-server, react]
---

# Nx 22 Vite Integration and Configuration

## Overview

The `@nx/vite` plugin integrates [Vite](https://vite.dev/) — a modern, fast build tool — into Nx workspaces. Vite provides instant dev server startup and extremely fast HMR (Hot Module Replacement) by leveraging native browser ES modules instead of pre-bundling. In Nx 22, `@nx/vite` is the recommended build tool for React, Angular (with caveats), and generic web applications.

> **Critical compatibility note for this project:** nx-electron requires **Webpack**, not Vite. The Electron main process must be bundled with Webpack. If you add a React frontend that uses Vite, the Electron app itself must still use `@nx/webpack:webpack`. See [Vite vs Webpack section](#vite-vs-webpack-in-nx) for details.

## What Is Vite?

Vite is a build tool with two core components:

1. **Development server** — Serves source code as native ES modules directly to the browser, enabling instant HMR without rebundling. Edits to components appear nearly instantaneously.
2. **Production build** — Uses [Rollup](https://rollupjs.org/) under the hood to produce highly optimized static assets.

This architecture fundamentally differs from webpack's "bundle-first" approach, making Vite development feel much faster on large projects.

## @nx/vite Plugin

### Installation

```bash
nx add @nx/vite
```

### What the Plugin Provides

- **`@nx/vite:build` executor** — Production builds using Vite/Rollup
- **`@nx/vite:dev-server` executor** — Development server with HMR
- **`@nx/vite:test` executor** — Unit testing via [Vitest](https://vitest.dev/)
- **`@nx/vite:configuration` generator** — Add Vite to an existing project
- **Inferred tasks** — Nx can automatically infer `build`, `serve`, and `test` targets from `vite.config.ts` without explicit executor configuration

## Vite vs Webpack in Nx

| Feature | Vite | Webpack |
|---------|------|---------|
| Dev server startup | Near-instant (native ESM) | Slower (full bundle build) |
| HMR speed | Extremely fast | Moderate |
| Production bundler | Rollup | Webpack |
| Ecosystem maturity | Growing rapidly | Very mature |
| nx-electron compatibility | **Not supported** | **Required** |
| Angular support | Limited | Full |
| React support | Full | Full |

### When to Use Vite

- React or generic web applications in Nx 22
- Projects where developer experience (fast HMR) is a priority
- Library builds where Rollup's tree-shaking is beneficial

### When to Use Webpack

- **Electron apps using nx-electron** (required — nx-electron depends on Webpack)
- Angular projects (Angular uses its own build system by default)
- Projects that rely on webpack-specific loaders or plugins

### This Project: Electron + React

For an nx-electron project with a React frontend, the correct setup is:

| Project | Bundler | Reason |
|---------|---------|--------|
| `my-electron-app` | Webpack (`nx-electron:build`) | Required by nx-electron |
| `my-react-frontend` | Webpack (`@nx/webpack:webpack`) | Must be compatible with Electron file:// protocol; Vite dev server is browser-only |

While it is technically possible to use Vite for the frontend and serve via the Vite dev server during development, packaging for Electron distribution requires a static file build, which webpack handles more predictably in the nx-electron workflow.

## `vite.config.ts` Structure

A typical `vite.config.ts` for a React project in Nx:

```typescript
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/my-react-app',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    react(),
    nxViteTsPaths(),
  ],
  build: {
    outDir: '../../dist/apps/my-react-app',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
```

### Key Config Sections

| Section | Purpose |
|---------|---------|
| `root` | Project directory (use `__dirname`) |
| `cacheDir` | Vite's module pre-bundling cache (in `node_modules/.vite`) |
| `server.port` | Dev server port |
| `plugins` | Vite plugins (React, Nx TS paths, etc.) |
| `build.outDir` | Output directory for production build |
| `test` | Vitest configuration (when `includeVitest: true`) |

### `nxViteTsPaths` Plugin

This Nx-provided plugin maps TypeScript path aliases from `tsconfig.base.json` to Vite's module resolver, enabling cross-project imports like:

```typescript
import { MyComponent } from '@my-org/my-lib';
```

## Vite Configuration Generator

Add Vite to an existing project:

```bash
nx generate @nx/vite:configuration --project=my-react-app --uiFramework=react
```

### Generator Options

| Option | Type | Description |
|--------|------|-------------|
| `project` | string (required) | Project to configure |
| `uiFramework` | string (required) | `react` or `none` |
| `includeVitest` | boolean | Also configure Vitest for unit tests |
| `compiler` | string | Compiler for React: `babel` (default) or `swc` |
| `port` | number | Dev server port |
| `testEnvironment` | string | Vitest environment: `jsdom` (default) or `node` |
| `skipFormat` | boolean | Skip auto-formatting of generated files |

### Supported Conversion Sources

The generator can convert projects using:
- webpack / `@nx/webpack`
- `@nx/js:babel`
- `@nx/js:swc`
- `@nx/rollup:rollup`

**Not supported:** Angular, Next.js, esbuild, TypeScript-only projects.

## Build Executor

The `@nx/vite:build` executor compiles a Vite application for production.

### `project.json` Configuration

```json
{
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "options": {
        "outputPath": "dist/apps/my-react-app"
      },
      "configurations": {
        "production": {
          "mode": "production"
        },
        "development": {
          "mode": "development",
          "skipTypeCheck": true
        }
      }
    }
  }
}
```

### Build Executor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputPath` | string | — | Output directory for production build artifacts |
| `configFile` | string | — | Custom path to `vite.config.ts` |
| `buildLibsFromSource` | boolean | `true` | Read buildable libraries from source instead of building separately |
| `skipTypeCheck` | boolean | `false` | Skip TypeScript type-checking (speeds up build) |
| `tsConfig` | string | — | Custom `tsconfig.json` path for type-checking |
| `generatePackageJson` | boolean | — | Emit a `package.json` in the output directory |
| `watch` | boolean | `false` | Rebuild on file changes |
| `useEnvironmentsApi` | boolean | `false` | Enable Vite 6.0+ multi-environment builds |

### Running the Build

```bash
# Production build
nx build my-react-app

# Build with custom config
nx build my-react-app --configFile=apps/my-react-app/vite.config.special.ts

# Skip type checking for faster builds
nx build my-react-app --skipTypeCheck

# Watch mode
nx build my-react-app --watch
```

## Dev Server Executor

The `@nx/vite:dev-server` executor launches the Vite development server with HMR.

### `project.json` Configuration

```json
{
  "targets": {
    "serve": {
      "executor": "@nx/vite:dev-server",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "my-react-app:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "my-react-app:build:development",
          "hmr": true
        },
        "production": {
          "buildTarget": "my-react-app:build:production",
          "hmr": false
        }
      }
    }
  }
}
```

### Dev Server Executor Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `buildTarget` | string | Yes | Reference to the build target (e.g., `my-app:build`) |
| `buildLibsFromSource` | boolean | No | Read buildable libraries from source (default: `true`) |
| `proxyConfig` | string | No | Path to proxy configuration file |

Additional Vite server options (port, host, https) are configured in `vite.config.ts` under `server`.

### Running the Dev Server

```bash
# Start the development server
nx serve my-react-app

# The server will be available at http://localhost:4200 (default)
```

## Proxy Configuration

For API proxying during development, create a `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Reference it in `project.json`:

```json
{
  "serve": {
    "executor": "@nx/vite:dev-server",
    "options": {
      "buildTarget": "my-react-app:build",
      "proxyConfig": "apps/my-react-app/proxy.conf.json"
    }
  }
}
```

## Quick Reference

```bash
# Add Vite to an existing project
nx generate @nx/vite:configuration --project=my-app --uiFramework=react

# Production build
nx build my-react-app

# Start dev server
nx serve my-react-app

# Build all projects
nx run-many -t build

# Build with watch mode
nx build my-react-app --watch

# Skip type checking for faster CI builds
nx build my-react-app --skipTypeCheck
```

---

> **Remember:** For nx-electron projects, the Electron app and its frontend must use **Webpack** (`nx-electron:build` / `@nx/webpack:webpack`). Vite is only appropriate for standalone React/web apps that are not rendered inside Electron.
