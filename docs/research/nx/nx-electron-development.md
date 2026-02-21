---
title: "nx-electron Development Workflow: Build, Serve, Test, and Debug"
source:
  - url: "https://github.com/bennymeg/nx-electron"
    title: "nx-electron GitHub Repository (README)"
  - url: "https://github.com/bennymeg/nx-electron/blob/master/docs/debugging.md"
    title: "nx-electron Debugging Guide"
  - url: "https://github.com/bennymeg/nx-electron/blob/master/packages/nx-electron/src/executors/build/schema.json"
    title: "nx-electron Build Executor Schema"
  - url: "https://github.com/bennymeg/nx-electron/blob/master/packages/nx-electron/src/executors/execute/schema.json"
    title: "nx-electron Execute Executor Schema"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx-electron, electron, build, serve, test, debug, ipc, development-workflow]
---

# nx-electron Development Workflow: Build, Serve, Test, and Debug

## Overview

nx-electron provides three executors — `build`, `execute` (serve), and `package` — that integrate Electron's main process into the Nx task system. Development requires running the frontend app and the Electron app in separate terminals simultaneously; the Electron app loads the frontend via a local dev server URL or built files. Both apps use Webpack for bundling and TypeScript throughout.

## Executors

nx-electron ships three executors:

| Executor | Nx Target | Purpose |
|----------|-----------|---------|
| `build` | `nx build <electron-app>` | Compile and bundle the Electron main process |
| `execute` | `nx serve <electron-app>` | Launch Electron with live rebuild (watch mode) |
| `package` | `nx run <electron-app>:package` | Create distributable package |

## Development Workflow

### Running Frontend and Electron Simultaneously

Open two terminal windows and run these commands in parallel:

**Terminal 1 — Frontend:**
```bash
nx serve <frontend-app-name>
```

**Terminal 2 — Electron main process:**
```bash
nx serve <electron-app-name>
```

The Electron executor watches for changes to the main process code and rebuilds automatically. Side-by-side terminal windows (or a split terminal) are the recommended development setup.

### Building for Production

Build both apps before packaging. Order matters — frontend must be built first:

```bash
# 1. Build frontend
nx build <frontend-app-name>

# 2. Build electron main process
nx build <electron-app-name>

# 3. Package (creates distributable)
nx run <electron-app-name>:package
```

### Testing

Test suites are independent and run per-project:

```bash
# Test frontend
nx test <frontend-app-name>

# Test electron main process
nx test <electron-app-name>

# Run all affected tests
nx affected -t test
```

## Build Executor Options

Configured in `project.json` under the `build` target. All options are passed via `options` or as CLI flags.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `main` | string | required | Entry point file path |
| `tsConfig` | string | required | TypeScript config file path |
| `outputPath` | string | — | Output directory for compiled files |
| `watch` | boolean | `false` | Rebuild when files change |
| `poll` | number | — | File watcher frequency in ms |
| `sourceMap` | boolean | `true` | Emit source maps |
| `progress` | boolean | `false` | Log build progress to console |
| `assets` | array | `[]` | Static assets to copy to output |
| `externalDependencies` | string/array | `"all"` | Keep external: `"all"`, `"none"`, or named module list |
| `implicitDependencies` | array | `[]` | Dependencies to include in generated `package.json` |
| `generatePackageJson` | boolean | `true` | Generate `package.json` with node_modules for distribution |
| `statsJson` | boolean | `false` | Output `stats.json` for bundle analysis |
| `verbose` | boolean | `false` | Emit verbose output |
| `extractLicenses` | boolean | `false` | Extract all licenses to a separate file |
| `obfuscate` | boolean | `false` | Obfuscate built output |
| `optimization` | boolean | `false` | Enable build optimization |
| `memoryLimit` | number | `2048` | Memory limit for TypeScript checking service (MB) |
| `fileReplacements` | array | `[]` | Swap files at build time (`replace` + `with`) |
| `webpackConfig` | string | — | Path to custom webpack config function |
| `buildLibsFromSource` | boolean | `true` | Read buildable libraries from source |
| `extraMetadata` | object | `{}` | Additional metadata to merge into output |

### Example `project.json` Build Target

```jsonc
{
  "targets": {
    "build": {
      "executor": "nx-electron:build",
      "options": {
        "outputPath": "dist/apps/electron-app",
        "main": "apps/electron-app/src/main.ts",
        "tsConfig": "apps/electron-app/tsconfig.app.json",
        "assets": ["apps/electron-app/src/assets"],
        "externalDependencies": "all"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "extractLicenses": true,
          "sourceMap": false
        }
      }
    }
  }
}
```

## Serve (Execute) Executor Options

The `execute` executor wraps the `build` executor and launches Electron after each successful build.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `buildTarget` | string | required | Target to build the app (e.g., `"electron-app:build"`) |
| `buildTargetOptions` | object | `{}` | Additional options passed to the build target |
| `watch` | boolean | `true` | Rebuild and restart on file changes |
| `waitUntilTargets` | array | `[]` | Targets to run before launching Electron |
| `port` | number | `5858` | Port for Node.js inspector (`0` = random) |
| `remoteDebuggingPort` | number | — | Port for Electron renderer remote debugging |
| `inspect` | string/boolean | `"inspect"` | Debug mode: `"inspect"`, `"inspect-brk"`, `"inspect-brk-node"` |
| `args` | array | `[]` | Extra CLI args passed to the Electron process |

### Example `project.json` Serve Target

```jsonc
{
  "targets": {
    "serve": {
      "executor": "nx-electron:execute",
      "options": {
        "buildTarget": "electron-app:build",
        "waitUntilTargets": ["frontend-app:serve"]
      }
    }
  }
}
```

> **Note:** `waitUntilTargets` can ensure the frontend dev server is ready before Electron launches, but running each in a separate terminal (as described above) is the typical approach.

## Debugging

### VS Code — Hot Reload Debugging (Recommended for Development)

Hot reload debugging attaches to a running `nx serve` process. Because live reload restarts the process, you must attach rather than launch.

**Step 1 — Add a serve script to `package.json`:**

```jsonc
{
  "scripts": {
    "serve:main": "nx serve --inspect=inspect-brk electron-app-name"
  }
}
```

**Step 2 — Add `.vscode/launch.json`:**

```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Electron (hot reload)",
      "type": "node",
      "request": "attach",
      "port": 5858,
      "restart": true,
      "sourceMaps": true
    }
  ]
}
```

**Step 3 — Workflow:**
1. Run `npm run serve:main` (or `nx serve --inspect=inspect-brk electron-app-name`) in the terminal
2. In VS Code, start the "Attach to Electron" debug configuration
3. The debugger reconnects automatically after each live reload

### VS Code — Static Debugger (Build Once and Launch)

For a launch-based debugger that builds before starting:

**`.vscode/launch.json`:**

```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Electron (debug)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "runtimeArgs": ["--inspect-brk=5858", "dist/apps/electron-app-name/main.js"],
      "port": 5858,
      "outputCapture": "std",
      "preLaunchTask": "build:main",
      "sourceMaps": true
    }
  ]
}
```

**`.vscode/tasks.json`:**

```jsonc
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build:main",
      "type": "shell",
      "command": "nx build electron-app-name"
    }
  ]
}
```

### JetBrains (WebStorm / Rider)

**Step 1 — Modify the serve target in `project.json`:**

```jsonc
{
  "targets": {
    "serve": {
      "executor": "nx-electron:execute",
      "options": {
        "buildTarget": "electron-app:build",
        "inspect": true,
        "args": ["--remote-debugging-port=9223"]
      }
    }
  }
}
```

**Step 2 — Create a debug configuration in the IDE:**

- Type: "Attach to Node.js/Chrome"
- Host: `localhost`
- Port: `9223` (or your custom `remoteDebuggingPort`)

This enables debugging of both the main process (Node.js) and the renderer process (Chrome DevTools Protocol).

### Inspect Flag Values

| Value | Effect |
|-------|--------|
| `"inspect"` | Start inspector; execution begins immediately |
| `"inspect-brk"` | Start inspector; pause at first line of main process |
| `"inspect-brk-node"` | Start inspector; pause at first line before any user code |

## IPC Patterns

Electron's inter-process communication (IPC) connects the main process (`electron-app`) to the renderer (frontend). All renderer-to-main communication must go through a preload script for security.

### Main Process (`ipcMain`)

```typescript
// apps/electron-app/src/app/api.ts
import { ipcMain } from 'electron';

// Handle request-response pattern
ipcMain.handle('get-data', async (event, args) => {
  const result = await someAsyncOperation(args);
  return result;
});

// Handle fire-and-forget pattern
ipcMain.on('log-message', (event, message: string) => {
  console.log('[Main]', message);
});
```

### Preload Script

The preload script runs in the renderer context but has access to Node.js APIs. It bridges the renderer and main process safely using `contextBridge`.

```typescript
// apps/electron-app/src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getData: (args: unknown) => ipcRenderer.invoke('get-data', args),
  logMessage: (message: string) => ipcRenderer.send('log-message', message),
  onUpdate: (callback: (value: unknown) => void) =>
    ipcRenderer.on('update', (_event, value) => callback(value)),
});
```

Register the preload script when creating the `BrowserWindow`:

```typescript
// apps/electron-app/src/main.ts
import { BrowserWindow } from 'electron';
import * as path from 'path';

const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false, // Keep false for security
  },
});
```

### Renderer (Frontend)

The frontend accesses the exposed API via `window.electronAPI`:

```typescript
// apps/frontend-app/src/app/app.component.ts (Angular example)
declare global {
  interface Window {
    electronAPI: {
      getData: (args: unknown) => Promise<unknown>;
      logMessage: (message: string) => void;
      onUpdate: (callback: (value: unknown) => void) => void;
    };
  }
}

// Usage
const data = await window.electronAPI.getData({ id: 1 });
window.electronAPI.logMessage('Hello from renderer');
window.electronAPI.onUpdate((value) => console.log('Update:', value));
```

### Sending Events from Main to Renderer

```typescript
// In main process — push data to renderer
win.webContents.send('update', { timestamp: Date.now() });
```

## Frontend URL Configuration

The Electron `BrowserWindow` must load the frontend. In development, load the frontend dev server URL; in production, load the built file via `file://`.

```typescript
// apps/electron-app/src/main.ts
import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({ /* ... */ });

  if (!app.isPackaged) {
    // Development: load frontend dev server
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    // Production: load built frontend file
    win.loadFile('path/to/frontend/index.html');
  }
}
```

> **Important:** The frontend must use hash-based routing (`HashRouter` in React or `useHash: true` in Angular) and set `baseHref` to `"./"` for `file://` protocol compatibility in production. See `nx-electron-setup.md` for details.
