---
title: "Nx 22 Workspace Setup and Configuration"
source:
  - url: "https://nx.dev/docs/reference/create-nx-workspace"
    title: "create-nx-workspace | Nx"
  - url: "https://nx.dev/reference/nx-json"
    title: "nx.json Reference | Nx"
  - url: "https://nx.dev/reference/project-configuration"
    title: "Project Configuration | Nx"
  - url: "https://nx.dev/concepts/mental-model"
    title: "Nx Mental Model | Nx"
  - url: "https://nx.dev/blog/nx-22-release"
    title: "Nx 22 Release | Nx Blog"
  - url: "https://nx.dev/features/integrate-with-editors"
    title: "Integrate with Editors | Nx"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, nx-22, workspace, monorepo, configuration, setup]
---

# Nx 22 Workspace Setup and Configuration

## Overview

Nx is a build system for monorepos that accelerates development by providing computation caching, task orchestration, and rich developer tooling. Version 22 (current stable: 22.5.2) introduces database-backed caching, improved terminal UI, polyglot support, and self-healing CI. This document covers creating and configuring an Nx 22 integrated monorepo workspace.

## Installing Nx 22

Create a new Nx workspace using the `create-nx-workspace` CLI. The interactive setup guides you through all options.

```bash
npx create-nx-workspace@22 <workspace-name>
```

### Key Command Options

| Option | Values | Description |
|--------|--------|-------------|
| `--workspaceType` | `integrated`, `package-based`, `standalone` | Monorepo style |
| `--preset` | `react`, `angular`, `vue`, `next`, `nest`, `express`, `empty`, etc. | Starting template |
| `--appName` | string | Name of the initial application |
| `--bundler` | `webpack`, `vite`, `esbuild`, `swc` | Build tool |
| `--style` | `css`, `scss`, `tailwind`, etc. | CSS approach |
| `--unitTestRunner` | `jest`, `vitest`, `none` | Test framework |
| `--e2eTestRunner` | `playwright`, `cypress`, `none` | E2E test framework |
| `--packageManager` | `npm`, `yarn`, `pnpm`, `bun` | Package manager (default: npm) |
| `--nxCloud` | GitHub, GitLab, Azure, etc. | CI/CD integration |

### Integrated vs. Standalone vs. Package-Based

- **Integrated** — Apps and libs live under `apps/` and `libs/`. Nx manages everything centrally. Best for teams that want strong conventions and sharing.
- **Standalone** — Single-app workspace. Useful when you have one app but want Nx's caching and tooling.
- **Package-based** — Each package manages its own `package.json`. Similar to npm/yarn workspaces with Nx layered on top.

For the `time-tracker` project, **integrated** is the right choice (Electron + frontend in one monorepo).

```bash
# Example: create an integrated React monorepo with webpack
npx create-nx-workspace@22 time-tracker \
  --workspaceType=integrated \
  --preset=react-monorepo \
  --appName=frontend \
  --bundler=webpack \
  --style=css \
  --packageManager=npm
```

## Workspace Directory Structure

After creating an integrated workspace, the directory layout looks like:

```
time-tracker/
├── apps/
│   ├── frontend/              # Application project
│   │   ├── src/
│   │   ├── project.json       # Project-level configuration
│   │   └── tsconfig.json
│   └── frontend-e2e/          # End-to-end test project
│       └── project.json
├── libs/                      # Shared libraries (initially empty)
├── nx.json                    # Workspace-level Nx configuration
├── tsconfig.base.json         # Base TypeScript config (path aliases)
├── package.json               # Root package.json with devDependencies
└── .nx/                       # Nx cache and database (gitignored)
    └── cache/
```

### Key Root Files

| File | Purpose |
|------|---------|
| `nx.json` | Workspace-level configuration (targets, caching, plugins) |
| `tsconfig.base.json` | Shared TS config; defines `@org/lib` path aliases for libs |
| `package.json` | Root deps; all projects share the same `node_modules` |
| `.nx/cache/` | Local computation cache (gitignored by default) |

## nx.json Configuration

`nx.json` is the central workspace configuration file. Below are the key fields for Nx 22.

### Full Example

```json
{
  "extends": "nx/presets/npm.json",
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "parallel": 3,
  "cacheDirectory": ".nx/cache",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/jest.config.ts"
    ],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true,
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"]
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    }
  },
  "plugins": [
    {
      "plugin": "@nx/eslint/plugin",
      "options": { "targetName": "lint" }
    }
  ],
  "generators": {
    "@nx/react": {
      "application": { "style": "css", "linter": "eslint" },
      "library": { "style": "css", "linter": "eslint" }
    }
  }
}
```

### Key Fields Reference

#### `defaultBase`
The base branch for `nx affected` calculations. Defaults to `main`.

```json
{ "defaultBase": "main" }
```

#### `parallel`
Maximum number of tasks that run simultaneously. Defaults to 3.

```json
{ "parallel": 4 }
```

#### `cacheDirectory`
Where local cache is stored. Defaults to `.nx/cache`.

```json
{ "cacheDirectory": ".nx/cache" }
```

**Note:** Nx 22 now uses database-backed caching. `NX_DISABLE_DB` has been removed — database caching is mandatory.

#### `namedInputs`
Define reusable sets of inputs for cache invalidation. Reference them in `targetDefaults.inputs` by name.

```json
{
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/cypress/**/*"
    ],
    "sharedGlobals": [
      "{workspaceRoot}/babel.config.json"
    ]
  }
}
```

Input types:
- File globs — `{projectRoot}/**/*` or `{workspaceRoot}/shared/**`
- Named input reference — `"production"`, `"default"`
- Runtime value — `{ "runtime": "node --version" }`
- Environment variable — `{ "env": "MY_VAR" }`
- Negation — `"!{projectRoot}/**/*.spec.ts"` (exclude from cache key)

#### `targetDefaults`
Set common configurations for targets workspace-wide. Can be keyed by target name (e.g., `"build"`) or executor (e.g., `"@nx/jest:jest"`).

```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "outputs": ["{workspaceRoot}/dist/{projectRoot}"],
      "cache": true
    },
    "@nx/jest:jest": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true,
      "options": { "passWithNoTests": true }
    }
  }
}
```

#### `plugins`
Register Nx plugins that auto-infer tasks from tool configuration files. In Nx 22, CreateNodes V1 is removed — only V2 is supported.

```json
{
  "plugins": [
    "@my-org/my-plugin",
    {
      "plugin": "@nx/eslint/plugin",
      "options": { "targetName": "lint" },
      "include": ["apps/**/*"],
      "exclude": ["**/*-e2e/**/*"]
    }
  ]
}
```

#### `generators`
Set default options for code generators so you don't have to pass flags every time.

```json
{
  "generators": {
    "@nx/react": {
      "application": { "style": "css", "linter": "eslint" },
      "library": { "style": "css", "linter": "eslint", "unitTestRunner": "vitest" }
    }
  }
}
```

#### `release` (Nx 22)
In Nx 22, the release configuration uses a nested `releaseTag` object (flat `releaseTagPattern` is removed):

```json
{
  "release": {
    "projectsRelationship": "independent",
    "releaseTag": {
      "pattern": "{projectName}@{version}",
      "requireSemver": true
    },
    "version": { "conventionalCommits": true },
    "changelog": {
      "workspaceChangelog": { "createRelease": "github" }
    }
  }
}
```

## project.json Configuration

Each project (app or lib) can have a `project.json` file that defines its targets (tasks).

### Full Example

```json
{
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "name": "frontend",
  "projectType": "application",
  "sourceRoot": "apps/frontend/src",
  "root": "apps/frontend",
  "tags": ["scope:frontend", "type:app"],
  "implicitDependencies": ["shared-utils"],
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{workspaceRoot}/dist/apps/frontend"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/frontend",
        "index": "apps/frontend/src/index.html",
        "main": "apps/frontend/src/main.tsx",
        "tsConfig": "apps/frontend/tsconfig.app.json"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "outputHashing": "all"
        },
        "development": {
          "optimization": false
        }
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "continuous": true,
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "frontend:build"
      },
      "configurations": {
        "development": { "buildTarget": "frontend:build:development" },
        "production": { "buildTarget": "frontend:build:production" }
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/apps/frontend"],
      "options": {
        "jestConfig": "apps/frontend/jest.config.ts"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"]
    }
  }
}
```

### Target Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `executor` | string | `"@package/name:executorName"` — the task runner |
| `command` | string | Shorthand; runs via `run-commands` executor |
| `options` | object | Executor-specific default options |
| `configurations` | object | Named presets that override `options` |
| `defaultConfiguration` | string | Which configuration to use when none specified |
| `dependsOn` | array | Prerequisite tasks before this one runs |
| `inputs` | array | Files/vars that affect cache invalidation |
| `outputs` | array | Directories/files to store and replay from cache |
| `cache` | boolean | Enable result caching for this target |
| `continuous` | boolean | Mark as long-running (won't block dependent tasks) |
| `parallelism` | boolean | Allow simultaneous runs on the same machine |

### `dependsOn` Patterns

```json
{
  "dependsOn": [
    "^build",           // build all dependencies first (^ = upstream)
    "build",            // build this project first
    { "target": "build", "projects": "dependencies" },
    { "target": "codegen", "projects": "self" }
  ]
}
```

### `inputs` and `outputs` Patterns

```json
{
  "inputs": [
    "production",                              // named input from nx.json
    "^production",                             // named input from dependencies
    "{projectRoot}/**/*.ts",                   // file glob
    { "env": "NODE_ENV" },                     // environment variable
    { "runtime": "node --version" }            // runtime value
  ],
  "outputs": [
    "{workspaceRoot}/dist/{projectRoot}",      // build artifacts
    "{workspaceRoot}/coverage/{projectRoot}"   // test coverage
  ]
}
```

### Project-Level Properties

```json
{
  "name": "frontend",
  "projectType": "application",      // "application" or "library"
  "root": "apps/frontend",           // project root directory
  "sourceRoot": "apps/frontend/src", // source files root
  "tags": ["scope:app", "type:ui"],  // for lint and organizational rules
  "implicitDependencies": ["shared-config"] // manual dep not in source
}
```

## Adding Plugins

Nx plugins extend the workspace with new executors, generators, and inferred targets.

### Installing a Plugin

```bash
# Install directly
npm install -D @nx/react

# Or use nx add (installs and configures automatically)
nx add @nx/react
nx add nx-electron
```

### Registering in nx.json

Plugins that auto-infer targets must be registered in `nx.json`:

```json
{
  "plugins": [
    {
      "plugin": "@nx/webpack/plugin",
      "options": {
        "buildTargetName": "build",
        "serveTargetName": "serve",
        "previewTargetName": "preview"
      }
    }
  ]
}
```

Plugins using generators don't need registration — they're available after install.

## Nx CLI Essentials

### Core Commands

| Command | Description |
|---------|-------------|
| `nx generate <generator>` | Scaffold code (shorthand: `nx g`) |
| `nx run <project>:<target>` | Run a target (shorthand: `nx <target> <project>`) |
| `nx run-many --target=<t>` | Run target on multiple/all projects |
| `nx affected --target=<t>` | Run target on projects affected by changes |
| `nx graph` | Open interactive project dependency graph |
| `nx show projects` | List all projects in the workspace |
| `nx show project <name>` | Show all targets for a project |
| `nx reset` | Clear local cache and stop daemon |

### Generate Examples

```bash
# Generate a React application
nx g @nx/react:app my-app --bundler=webpack

# Generate a shared library
nx g @nx/react:lib shared-ui --bundler=webpack

# Generate a component inside a project
nx g @nx/react:component Button --project=shared-ui

# Generate with nx-electron
nx g nx-electron:app desktop --frontendProject=frontend
```

### Running Targets

```bash
# Run build for a project
nx build frontend

# Run with a specific configuration
nx build frontend --configuration=production

# Run multiple targets in parallel
nx run-many --target=build --projects=frontend,desktop

# Run affected targets (CI optimization)
nx affected --target=test --base=main --head=HEAD
```

## Core Concepts (Mental Model)

Understanding how Nx works helps configure it correctly.

### Project Graph

Nx analyzes source code, `package.json` dependencies, and `tsconfig.json` paths to build a directed graph of project dependencies. This graph powers `nx affected` and dependency visualization.

```bash
nx graph  # Opens browser with interactive graph
```

### Task Graph

When you run a command, Nx builds a task graph from the project graph and `dependsOn` configurations. Tasks without dependencies run in parallel; tasks with `dependsOn` wait for prerequisites.

### Computation Caching

Before running a task, Nx computes a hash from:
- Source files matching `inputs`
- Dependency outputs
- Environment variables and runtime values in `inputs`
- Nx version and executor version

If the hash matches a cached result (local `.nx/cache/` or remote Nx Cloud), Nx replays the output without re-running. In Nx 22, caching uses a mandatory SQLite database backend.

### Affected Analysis

```bash
# Show which projects are affected by changes since main
nx affected --target=test --base=main

# Show affected project list without running
nx affected:graph
```

Nx traces which files changed (via git diff) and walks the project graph to find all projects that could be impacted.

## IDE Integration

### Nx Console (VS Code / JetBrains)

Install **Nx Console** from the VS Code Marketplace or JetBrains Marketplace for:
- Visual UI for running generators and targets
- Project Details View showing all inferred and explicit targets
- Dependency graph visualization within the editor
- AI-enhanced workspace context

```bash
# Open project details for a specific project
nx show project frontend --web
```

### Key VS Code Settings

After installing Nx Console, the extension auto-detects the workspace. You can use the command palette (`Cmd+Shift+P`) to:
- `Nx: Run Target` — pick project and target from dropdowns
- `Nx: Generate` — interactive generator UI
- `Nx: Graph` — open dependency graph in panel
