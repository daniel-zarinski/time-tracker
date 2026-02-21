---

title: "Nx 22 & nx-electron Research Index"
source:

- url: "[https://nx.dev/docs/getting-started/intro](https://nx.dev/docs/getting-started/intro)"
title: "Nx Documentation - Getting Started"
- url: "[https://github.com/bennymeg/nx-electron](https://github.com/bennymeg/nx-electron)"
title: "nx-electron GitHub Repository"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, nx-electron, electron, monorepo, desktop-app, react, typescript]

---

# Nx 22 & nx-electron Research Index

## Overview

This research covers **Nx 22** (build system for monorepos) and **nx-electron 22** (Electron plugin for Nx), the two core technologies used to build the time-tracker Electron desktop application. Nx 22.5.2 is the current stable release; nx-electron 22.0.0 is the matching plugin version.

All documentation is sourced exclusively from official sources: [nx.dev](https://nx.dev), the [nx-electron GitHub repository](https://github.com/bennymeg/nx-electron), and npm registry metadata.

## How It All Fits Together

### Reading Order

Start with the **Nx foundation** files, then move to **nx-electron specifics**, and finally the **tooling & quality** files:

**Layer 1 — Nx Foundation:**

1. [nx-workspace-setup.md](nx-workspace-setup.md) — Start here. Understand how to create an Nx 22 workspace, the directory structure, and the two key config files: `nx.json` (workspace-wide) and `project.json` (per-project targets).
2. [nx-task-running.md](nx-task-running.md) — Learn how Nx runs tasks: `nx run`, `run-many`, `affected`, task pipelines with `dependsOn`, and parallel execution. This is how you'll interact with Nx daily.
3. [nx-caching.md](nx-caching.md) — Deep dive into how Nx caching works internally: hash computation, inputs/outputs, named inputs, cache restoration. Understanding caching is key to fast builds.

**Layer 2 — React & TypeScript:**
4. [nx-react.md](nx-react.md) — The `@nx/react` plugin: app/library/component generators, project structure, routing (HashRouter required for Electron), and webpack configuration.
5. [nx-typescript-libraries.md](nx-typescript-libraries.md) — How to share code via TypeScript libraries in the monorepo: project linking, buildable libraries, tsconfig paths, barrel exports. Focus is on internal monorepo use (not publishing to npm).

**Layer 3 — Electron Integration:**
6. [nx-electron-setup.md](nx-electron-setup.md) — Installing nx-electron, generating the Electron app with `--frontendProject`, version alignment rules, and the generated project structure.
7. [nx-electron-development.md](nx-electron-development.md) — Day-to-day development: running frontend + electron in parallel terminals, build/serve/test executors, debugging in VS Code and JetBrains IDEs, IPC patterns.
8. [nx-electron-packaging.md](nx-electron-packaging.md) — Distribution: `package` vs `make`, electron-builder configuration via `maker.options.json`, platform-specific targets (Windows/macOS/Linux).

**Layer 4 — Tooling & Quality:**
9. [nx-eslint-prettier.md](nx-eslint-prettier.md) — ESLint flat config (Nx 22 default), Prettier integration, `@nx/enforce-module-boundaries` for architecture enforcement, workspace-wide linting.
10. [nx-vite.md](nx-vite.md) — Vite integration in Nx 22 (default for new projects). **Important caveat:** nx-electron requires Webpack, not Vite. This file documents Vite for reference and understanding the Nx ecosystem.
11. [nx-mcp-server.md](nx-mcp-server.md) — Nx MCP (Model Context Protocol) server for AI-assisted development: Cursor, VS Code Copilot, and Claude Code integration with workspace context.

### Key Dependencies

- **nx-electron requires Webpack** — The frontend project paired with nx-electron must use Webpack as its bundler, not Vite. This is a hard constraint.
- **nx-electron major version = Nx major version** — nx-electron 22.x works only with Nx 22.x.
- **Hash-based routing** — The React frontend must use `HashRouter` (not `BrowserRouter`) because Electron loads via `file://` protocol.
- **Frontend `baseHref`** — Must be set to `"./"` for Electron compatibility.

## Key Concepts


| Concept                        | Description                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| **Nx Workspace**               | An integrated monorepo managed by Nx, containing multiple projects (apps and libs)   |
| **nx-electron**                | An Nx plugin that adds Electron generators and executors to an Nx workspace          |
| **@nx/react**                  | The React plugin providing app, library, and component generators                    |
| **Executor**                   | An Nx task runner (build, serve, test, package, make) configured in project.json     |
| **Generator**                  | An Nx code scaffolding tool that creates or modifies project files                   |
| **Task Pipeline**              | Dependency ordering between targets (e.g., build frontend before packaging electron) |
| **Caching**                    | Nx computes hashes from task inputs; cache hits replay outputs without re-running    |
| **electron-builder**           | The underlying tool nx-electron uses for packaging and creating installers           |
| **Version Alignment**          | nx-electron major version must match Nx major version (22.x ↔ 22.x)                  |
| **ESLint Flat Config**         | Nx 22 uses `eslint.config.js` (flat config) by default, replacing `.eslintrc.json`   |
| **MCP Server**                 | Model Context Protocol server connecting AI agents to Nx workspace context           |
| **TypeScript Project Linking** | Nx manages tsconfig paths and project references for cross-project imports           |


## File Index


| File                                                     | Description                                                                        | Depends On                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [nx-workspace-setup.md](nx-workspace-setup.md)           | Nx 22 installation, workspace creation, nx.json & project.json configuration       | —                                                                          |
| [nx-task-running.md](nx-task-running.md)                 | Task execution, caching basics, pipelines, affected commands, parallelism          | [nx-workspace-setup.md](nx-workspace-setup.md)                             |
| [nx-caching.md](nx-caching.md)                           | Caching deep-dive: hash computation, inputs/outputs, named inputs, troubleshooting | [nx-task-running.md](nx-task-running.md)                                   |
| [nx-react.md](nx-react.md)                               | @nx/react plugin: generators, project structure, routing, webpack config           | [nx-workspace-setup.md](nx-workspace-setup.md)                             |
| [nx-typescript-libraries.md](nx-typescript-libraries.md) | TypeScript project linking, buildable libraries, code sharing patterns             | [nx-react.md](nx-react.md)                                                 |
| [nx-electron-setup.md](nx-electron-setup.md)             | nx-electron plugin installation, app generation, project structure                 | [nx-workspace-setup.md](nx-workspace-setup.md), [nx-react.md](nx-react.md) |
| [nx-electron-development.md](nx-electron-development.md) | Build, serve, test workflows; live reload; debugging; IPC patterns                 | [nx-electron-setup.md](nx-electron-setup.md)                               |
| [nx-electron-packaging.md](nx-electron-packaging.md)     | Packaging, making installers, electron-builder configuration                       | [nx-electron-development.md](nx-electron-development.md)                   |
| [nx-eslint-prettier.md](nx-eslint-prettier.md)           | ESLint flat config, Prettier, module boundary enforcement                          | [nx-workspace-setup.md](nx-workspace-setup.md)                             |
| [nx-vite.md](nx-vite.md)                                 | Vite integration in Nx (reference; nx-electron requires Webpack)                   | [nx-workspace-setup.md](nx-workspace-setup.md)                             |
| [nx-mcp-server.md](nx-mcp-server.md)                     | Nx MCP server for AI-assisted development (Cursor, VS Code, Claude)                | [nx-workspace-setup.md](nx-workspace-setup.md)                             |


