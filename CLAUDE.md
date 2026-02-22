# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**time-tracker** — An Electron desktop application built with an Nx monorepo using the [nx-electron](https://github.com/bennymeg/nx-electron) plugin.

## Tech Stack

- **Monorepo:** Nx 22 (integrated monorepo style)
- **Desktop:** Electron via `nx-electron` 22
- **Bundler:** Webpack (required by nx-electron)
- **Frontend:** React 19 with React Router 6 (`HashRouter`)
- **Styling:** Tailwind CSS v4
- **Testing:** Jest
- **Linting:** ESLint 9

## Apps

| App | Path | Description |
|-----|------|-------------|
| `renderer` | `apps/renderer/` | React frontend rendered inside Electron BrowserWindow |
| `desktop` | `apps/desktop/` | Electron main process — windows, IPC, native APIs |

## Nx Commands

| Task | Command |
|------|---------|
| Serve frontend | `nx serve renderer` |
| Serve electron | `nx serve desktop` |
| Build frontend | `nx build renderer` |
| Build electron | `nx build desktop` |
| Test frontend | `nx test renderer` |
| Lint | `nx lint renderer` / `nx lint desktop` |
| Package electron | `nx run desktop:package` |
| Make installer | `nx run desktop:make` |
| Run affected tests | `nx affected --target=test` |
| Dependency graph | `nx graph` |
| Generate Prisma client | `nx run database:generate` |
| Create migration | `nx run database:migrate-dev` |
| Apply migrations (prod) | `nx run database:migrate-deploy` |
| Push schema (no migration) | `nx run database:push` |
| Open Prisma Studio | `nx run database:studio` |

**Dev workflow:** Run `nx serve renderer` and `nx serve desktop` in separate terminals simultaneously.

**Before packaging:** Build both `renderer` and `desktop` first.

## Architecture

This is an Nx integrated monorepo with two apps:

- **`renderer`** — The React UI rendered inside the Electron BrowserWindow (webpack-bundled)
- **`desktop`** — The main process that creates windows, handles IPC, and manages native functionality

Frontend routing uses `HashRouter` and `baseHref` is set to `"./"` for Electron `file://` protocol compatibility.

### IPC Pattern

Electron's main process and renderer communicate via IPC:
- **Main process** (`desktop`): Uses `ipcMain.handle()` / `ipcMain.on()`
- **Renderer** (`renderer`): Uses `ipcRenderer.invoke()` / `ipcRenderer.send()` via a preload script

## Documentation

Research documentation lives in `docs/research/<package-name>/`. All research docs must follow the template at [`docs/research/template.md`](docs/research/template.md), which defines:

- YAML frontmatter schema (title, source URLs, dates, status, tags)
- `_index.md` format (one per package folder, read-first entry point)
- Topic file format (one focused concept per file)
- Rules: max ~200 lines/file, mandatory sources and dates, kebab-case naming

## Conventions

- Project names, file names, and directories use kebab-case
- Nx generators should be used to scaffold new libraries and apps (`nx g @nx/react:lib`, etc.)
- Shared code goes in Nx libraries under `libs/`

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
