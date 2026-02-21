# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**time-tracker** — An Electron desktop application built with an Nx monorepo using the [nx-electron](https://github.com/bennymeg/nx-electron) plugin.

**Status:** Project initialization in progress.

## Tech Stack

- **Monorepo:** Nx (integrated monorepo style)
- **Desktop:** Electron via `nx-electron` plugin
- **Bundler:** Webpack (required by nx-electron)
- **Frontend:** TBD (React, Angular, or other — to be chosen during `create-nx-workspace`)

## Project Setup (from scratch)

The workspace must be initialized with these steps in order:

```bash
# 1. Create Nx workspace (integrated monorepo, webpack bundler)
npx create-nx-workspace@21 time-tracker

# 2. Install nx-electron plugin (major version must match Nx major version)
npm install -D nx-electron

# 3. Generate the Electron app (requires an existing frontend project)
nx g nx-electron:app <electron-app-name> --frontendProject=<frontend-app-name>
```

**Critical:** nx-electron major version must match Nx major version (e.g., Nx 21.x requires nx-electron 21.x).

## Nx Commands

All commands use the `nx` CLI. Replace `<app>` with the actual project name.

| Task | Command |
|------|---------|
| Serve frontend | `nx serve <frontend-app>` |
| Serve electron | `nx serve <electron-app>` |
| Build frontend | `nx build <frontend-app>` |
| Build electron | `nx build <electron-app>` |
| Test frontend | `nx test <frontend-app>` |
| Test electron | `nx test <electron-app>` |
| Lint | `nx lint <app>` |
| Package electron | `nx run <electron-app>:package` |
| Make installer | `nx run <electron-app>:make` |
| Run single test file | `nx test <app> --testFile=<path>` |
| Run affected tests | `nx affected --target=test` |
| Dependency graph | `nx graph` |

**Dev workflow:** Run `nx serve <frontend-app>` and `nx serve <electron-app>` in separate terminals simultaneously.

**Before packaging:** Build both frontend and electron apps first.

## Architecture

This is an Nx integrated monorepo with (at minimum) two projects:

- **Frontend app** — The UI rendered inside the Electron BrowserWindow (webpack-bundled)
- **Electron app** — The main process that creates windows, handles IPC, and manages native functionality

Frontend routing must use hash strategy (`HashRouter` in React, `useHash: true` in Angular) and `baseHref` must be set to `"./"` for Electron file:// protocol compatibility.

### IPC Pattern

Electron's main process and renderer (frontend) communicate via IPC:
- **Main process** (`electron-app`): Uses `ipcMain.handle()` / `ipcMain.on()`
- **Renderer** (`frontend-app`): Uses `ipcRenderer.invoke()` / `ipcRenderer.send()` via a preload script

## Conventions

- Project names, file names, and directories use kebab-case
- Nx generators should be used to scaffold new libraries and apps (`nx g @nx/react:lib`, etc.)
- Shared code goes in Nx libraries under `libs/`
