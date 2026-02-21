---
title: "nx-electron Plugin Setup and App Generation"
source:
  - url: "https://github.com/bennymeg/nx-electron"
    title: "nx-electron GitHub Repository"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/README.md"
    title: "nx-electron README"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/packages/nx-electron/package.json"
    title: "nx-electron package.json (v22.0.0)"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/packages/nx-electron/src/generators/nx-electron/schema.json"
    title: "nx-electron App Generator Schema"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/packages/nx-electron/src/executors/build/schema.json"
    title: "nx-electron Build Executor Schema"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/packages/nx-electron/src/executors/execute/schema.json"
    title: "nx-electron Execute Executor Schema"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/packages/nx-electron/src/executors/package/schema.json"
    title: "nx-electron Package Executor Schema"
  - url: "https://raw.githubusercontent.com/bennymeg/nx-electron/refs/heads/master/packages/nx-electron/src/generators/nx-electron/generator.ts"
    title: "nx-electron App Generator Source"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx-electron, nx, electron, setup, generators, executors]
---

# nx-electron Plugin Setup and App Generation

## Overview

`nx-electron` is a community Nx plugin that integrates Electron desktop application development into an Nx monorepo. It provides generators to scaffold Electron main-process projects and executors to build, serve, package, and distribute them. Version 22.0.0 of nx-electron targets Nx 22.x and requires major version alignment between the two.

## Version Compatibility

The nx-electron major version **must match** the Nx major version. Mismatched versions will cause incompatibilities with `@nx/devkit` and `@nx/workspace` APIs.

| nx-electron version | Nx version |
|---------------------|------------|
| 22.0.0              | 22.x (e.g., 22.5.2) |
| 21.x                | 21.x       |

The `nx-electron` 22.0.0 package declares these peer dependencies:

```json
{
  "@nx/devkit": "^22.0.0",
  "@nx/workspace": "^22.0.0",
  "electron": "*"
}
```

## Prerequisites

Before installing nx-electron, the following must be in place:

1. **An Nx workspace** initialized with `npx create-nx-workspace@22`
2. **Integrated monorepo style** — nx-electron is designed for the integrated (not package-based) style
3. **Webpack bundler** — the build executor uses webpack; select webpack when creating the workspace
4. **A frontend project** already generated — the Electron app must reference an existing frontend project via `--frontendProject`

## Installation

Install nx-electron as a dev dependency after the workspace exists:

```bash
npm install -D nx-electron
```

There is no `nx add` or `nx init` step required; the plugin is available as generators and executors immediately after installation.

## App Generation

Generate a new Electron application with the `nx-electron:app` (aliased as `nx-electron:nx-electron`) generator:

```bash
nx g nx-electron:app <electron-app-name> --frontendProject=<frontend-app-name>
```

Example with a React frontend called `ui`:

```bash
nx g nx-electron:app desktop --frontendProject=ui
```

### Generator Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | — | **Required.** Name of the Electron application. |
| `frontendProject` | string | — | Name of the frontend project this Electron app will load. |
| `directory` | string | — | Subdirectory within `apps/` to place the project. |
| `extraProjects` | array | `[]` | Additional frontend projects that need access to this app. |
| `addProxy` | boolean | `false` | Add a proxy configuration to the frontend project's serve target. |
| `proxyPort` | number | `3000` | Port number used by the proxy server (when `addProxy` is true). |
| `linter` | string | `"eslint"` | Linting tool. Only `eslint` is supported. |
| `unitTestRunner` | string | `"jest"` | Test runner. Options: `jest` or `none`. |
| `tags` | string | — | Tags for the project (used by Nx lint boundary rules). |
| `skipFormat` | boolean | `false` | Skip running Prettier on generated files. |
| `skipPackageJson` | boolean | `false` | Do not add dependencies to root `package.json`. |
| `setParserOptionsProject` | boolean | `false` | Configure ESLint parser options for improved type-aware linting. |

## Generated Project Structure

After running the generator, the following structure is created under `apps/<electron-app-name>/`:

```
apps/<electron-app-name>/
├── src/
│   ├── main.ts                         # Electron main process entry point
│   ├── app/
│   │   ├── app.ts                      # BrowserWindow creation and app lifecycle
│   │   ├── constants.ts                # Renderer URL, app name, update server URL
│   │   ├── api/
│   │   │   └── main.preload.ts         # Preload script (contextBridge / ipcRenderer)
│   │   ├── events/
│   │   │   ├── electron.events.ts      # Electron lifecycle event handlers
│   │   │   ├── squirrel.events.ts      # Windows Squirrel installer events
│   │   │   └── update.events.ts        # Auto-updater event handlers
│   │   └── options/
│   │       └── maker.options.json      # Electron Forge packaging configuration
│   └── environments/
│       ├── environment.ts              # Development environment config
│       └── environment.prod.ts         # Production environment config
├── tsconfig.json
├── tsconfig.app.json
└── project.json                        # Nx project configuration with all targets
```

### Key Generated Files

**`src/main.ts`** — The Electron main process entry point. Bootstraps the app by importing event handlers and calling the app initialization in `app.ts`.

**`src/app/constants.ts`** — Contains the renderer app URL (pointing to the frontend), the Electron app name, and a placeholder update server URL. This file is auto-configured with the frontend project's serve port.

**`src/app/api/main.preload.ts`** — The preload script, loaded in a sandboxed context before the renderer. Use this to expose safe IPC bridges via `contextBridge.exposeInMainWorld()`.

**`src/app/options/maker.options.json`** — Static packaging options used by the `package` and `make` targets. Settings here override command-line flags.

## Project Configuration (project.json Targets)

The generator creates four targets in `project.json`:

```json
{
  "targets": {
    "build": {
      "executor": "nx-electron:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/<electron-app-name>",
        "main": "apps/<electron-app-name>/src/main.ts",
        "tsConfig": "apps/<electron-app-name>/tsconfig.app.json"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "extractLicenses": true,
          "fileReplacements": [
            {
              "replace": "apps/<electron-app-name>/src/environments/environment.ts",
              "with": "apps/<electron-app-name>/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    },
    "serve": {
      "executor": "nx-electron:execute",
      "options": {
        "buildTarget": "<electron-app-name>:build"
      }
    },
    "package": {
      "executor": "nx-electron:package",
      "options": {
        "name": "<electron-app-name>",
        "frontendProject": "<frontend-app-name>",
        "outputPath": "dist/packages",
        "sourcePath": "dist/apps"
      }
    },
    "make": {
      "executor": "nx-electron:make",
      "options": {
        "name": "<electron-app-name>",
        "frontendProject": "<frontend-app-name>",
        "outputPath": "dist/executables",
        "sourcePath": "dist/apps"
      }
    }
  }
}
```

### Executor Summary

| Target | Executor | Purpose |
|--------|----------|---------|
| `build` | `nx-electron:build` | Compile TypeScript main process via webpack |
| `serve` | `nx-electron:execute` | Build and launch Electron in watch mode |
| `package` | `nx-electron:package` | Bundle app + frontend for distribution |
| `make` | `nx-electron:make` | Create platform-specific installers |

## Frontend Requirements

The Electron main process loads the frontend using the `file://` protocol (in production) or `http://localhost:<port>` (in development). Two adjustments to the frontend project are **required**:

### 1. Set `baseHref` to `"./"`

The frontend build must use a relative base href so that assets resolve correctly under `file://` paths.

**React (via webpack config or Nx project.json):**
```json
{
  "options": {
    "baseHref": "./"
  }
}
```

**Angular (`project.json`):**
```json
{
  "options": {
    "baseHref": "./"
  }
}
```

### 2. Use Hash-Based Routing

HTML5 pushState routing (the browser default) does not work with `file://` URLs because the browser cannot resolve routes by changing the path. Hash-based routing (`#/route`) works because the hash is never sent to the server.

**React — use `HashRouter` instead of `BrowserRouter`:**
```tsx
import { HashRouter } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      {/* routes */}
    </HashRouter>
  );
}
```

**Angular — set `useHash: true` in `RouterModule.forRoot()`:**
```typescript
RouterModule.forRoot(routes, { useHash: true })
```

## Proxy Configuration (Optional)

If you pass `--addProxy` during generation, the generator modifies the frontend project's `serve` target to route API calls to the Electron backend:

- Creates or updates `proxy.conf.json` in the frontend project
- Adds a route for `/api` and `/<electron-app-name>-api` pointing to `http://localhost:<proxyPort>`

This is useful when the Electron main process exposes an HTTP API alongside IPC.

## Complete Setup Sequence

```bash
# 1. Create Nx 22 workspace (integrated, webpack)
npx create-nx-workspace@22 my-app

# 2. Generate a frontend app (example: React)
nx g @nx/react:app ui --bundler=webpack --routing --style=css

# 3. Install nx-electron (version must match Nx major)
npm install -D nx-electron

# 4. Generate the Electron app referencing the frontend
nx g nx-electron:app desktop --frontendProject=ui

# 5. Configure the frontend: set baseHref and hash routing (manual step)

# 6. Serve both in separate terminals
nx serve ui
nx serve desktop
```
