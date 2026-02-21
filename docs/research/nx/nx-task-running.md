---
title: "Nx 22 Task Running, Caching, and Pipelines"
source:
  - url: "https://nx.dev/features/run-tasks"
    title: "Run Tasks — Nx Documentation"
  - url: "https://nx.dev/features/cache-task-results"
    title: "Cache Task Results — Nx Documentation"
  - url: "https://nx.dev/concepts/task-pipeline-configuration"
    title: "Task Pipeline Configuration — Nx Documentation"
  - url: "https://nx.dev/features/explore-graph"
    title: "Explore the Graph — Nx Documentation"
  - url: "https://nx.dev/nx-api/nx/documents/run-many"
    title: "run-many CLI Reference — Nx Documentation"
  - url: "https://nx.dev/nx-api/nx/documents/affected"
    title: "affected CLI Reference — Nx Documentation"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, nx-22, tasks, caching, pipelines, affected, run-many]
---

# Nx 22 Task Running, Caching, and Pipelines

## Overview

Nx 22 provides a sophisticated task execution system that understands your project dependency graph to run tasks in the correct order, cache results to avoid redundant work, and intelligently determine which projects are affected by code changes. Tasks are defined in `project.json` or `package.json` per project and orchestrated globally via `nx.json`.

## Running Tasks

### Single Project

Run a specific target for a single project:

```bash
nx run <project>:<target>
# Shorthand:
nx <target> <project>
```

Examples:

```bash
nx run header:test
nx test header
nx build my-app
```

### Multiple Projects with `run-many`

Run a target across multiple or all projects:

```bash
# All projects
nx run-many -t build

# Specific projects
nx run-many -t test -p proj1 proj2

# Multiple targets at once
nx run-many --targets=lint,test,build

# Filter by name pattern
nx run-many -t test --projects='*-app' --exclude=excluded-app

# Filter by project tag
nx run-many -t test --projects='tag:api-*'
```

### `run-many` CLI Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `-t, --targets` | string | — | Targets to execute |
| `-p, --projects` | string | — | Projects to include (names, patterns, or `tag:`) |
| `--parallel` | string | `3` | Max concurrent processes |
| `--exclude` | string | — | Projects to exclude |
| `-c, --configuration` | string | — | Configuration variant to apply |
| `--graph` | string | — | Show task graph (browser, file path, or `"stdout"`) |
| `--nxBail` | boolean | `false` | Stop after first failure |
| `--skipNxCache` | boolean | `false` | Bypass local cache |
| `--verbose` | boolean | `false` | Show detailed command output |

## Task Pipelines

### Overview

Task pipelines define the order in which tasks must run. Nx uses a dependency graph to orchestrate execution: tasks with no dependencies run in parallel; tasks with declared dependencies run only after their prerequisites complete.

### `dependsOn` Configuration

Configured in `nx.json` under `targetDefaults`, or in individual `project.json` files.

**In `nx.json` (global defaults):**

```jsonc
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build", "prebuild"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

**In `project.json` (per-project override):**

```jsonc
{
  "targets": {
    "build": {
      "dependsOn": ["^build", "codegen"]
    }
  }
}
```

### The `^` Prefix

The caret (`^`) prefix means "run this task on all upstream dependency projects first."

| `dependsOn` value | Meaning |
|-------------------|---------|
| `"^build"` | Run `build` on all projects this project depends on |
| `"prebuild"` | Run `prebuild` in the **same** project first |
| `["^build", "prebuild"]` | Both of the above |

Example: If `app` depends on `lib`, then `nx build app` will automatically run `nx build lib` first when `dependsOn: ["^build"]` is set.

### Execution Behavior

Nx parallelizes tasks wherever the dependency graph allows. Only tasks with explicit `dependsOn` relationships run sequentially. This means unrelated projects' tasks can run simultaneously even when a pipeline is defined.

## Caching

### How Caching Works

Nx computes a **cache hash** for each task based on its inputs. If a matching hash exists in the cache, Nx replays the previous output (terminal output + generated files) without re-running the task. This includes restoring build artifacts in configured output directories.

### Enabling Caching

In `nx.json`, set `cache: true` in `targetDefaults` (required for Nx 17+):

```jsonc
{
  "targetDefaults": {
    "build": {
      "cache": true
    },
    "test": {
      "cache": true
    }
  }
}
```

Many Nx plugins automatically configure caching for their tasks, eliminating manual setup.

### Inputs Configuration

`inputs` controls what files and environment variables contribute to the cache hash. Use `!` to exclude patterns:

```jsonc
{
  "targetDefaults": {
    "build": {
      "cache": true,
      "inputs": [
        "{projectRoot}/**/*",
        "!{projectRoot}/**/*.md",
        "!{projectRoot}/**/*.spec.ts"
      ]
    }
  }
}
```

Common input sources:

- `{projectRoot}/**/*` — all files in the project
- `{workspaceRoot}/tsconfig.base.json` — shared config files
- Environment variables via `env` key

### Outputs Configuration

`outputs` specifies where task results are stored, so Nx knows what to restore from cache:

```jsonc
{
  "targetDefaults": {
    "build": {
      "cache": true,
      "outputs": ["{projectRoot}/dist", "{projectRoot}/build"]
    }
  }
}
```

### Cache Invalidation

The cache is invalidated (task re-runs) when any configured input changes. Tasks must be **side-effect free** to be safely cached — given identical inputs, they must produce identical outputs. Tasks that depend on external state (e.g., E2E tests hitting live APIs) should not be cached.

### Cache Storage

| Storage Type | Description |
|-------------|-------------|
| Local cache | Default; stored on the developer's machine |
| Remote cache | Via Nx Cloud; shared across CI runs and team members |

### Skipping Cache

```bash
# Skip local cache for a single run
nx build my-app --skipNxCache

# Also skip remote cache
nx build my-app --skipNxCache --skipRemoteCache
```

## Affected Commands

### How `nx affected` Works

`nx affected` determines which projects have changed relative to a base branch and which projects **depend on** those changed projects. Only affected projects have their tasks executed.

```bash
# Run tests for all affected projects
nx affected -t test

# Multiple targets
nx affected -t lint test build

# Specify base branch explicitly
nx affected -t test --base=main --head=HEAD
```

### Determining Affected Projects

Nx compares the current state against a base commit/branch using git. By default, the base is the `main` branch. "Affected projects" include:

1. Projects with changed source files
2. Projects that (transitively) depend on changed projects

### `affected` CLI Flags

| Flag | Purpose |
|------|---------|
| `-t, --targets` | Targets to run |
| `--base` | Base branch/commit for comparison (e.g., `main`) |
| `--head` | Latest commit reference (default: `HEAD`) |
| `--files` | Manually specify changed files |
| `--exclude` | Exclude specific projects |
| `--parallel` | Max concurrent processes (default: `3`) |
| `-c, --configuration` | Task configuration variant |
| `--graph` | Visualize task graph |
| `--nxBail` | Stop after first failure |
| `--skipNxCache` | Bypass local cache |
| `--skipRemoteCache` | Bypass remote cache |
| `--excludeTaskDependencies` | Skip dependent task execution |
| `--outputStyle` | Output format (`tui`, `dynamic`, `static`, `stream`) |

### Configuring `defaultBase`

Set the default base branch in `nx.json` to avoid specifying `--base` on every command:

```jsonc
{
  "defaultBase": "main"
}
```

### Filtering with Tags

```bash
# Only run affected dotnet projects
nx affected -t build --exclude='*,!tag:dotnet'
```

## Dependency Graph

### Visualizing the Project Graph

```bash
# Open interactive browser visualization
nx graph

# Focus on a single project and its dependencies
nx graph --focus my-app

# Export as JSON
nx graph --file=output.json
```

The graph is automatically generated from source code analysis and requires no manual maintenance. It shows:

- All projects in the workspace
- Which projects depend on which other projects
- The origin files that establish each dependency

### Interactive Features

- **Focus mode**: click a node or use `--focus <project>` to see only related projects
- **Search**: find projects by name pattern in the sidebar
- **Tooltips**: click a node to see project details and dependency file origins
- **Trace**: set Start/End projects to trace a dependency chain between them
- **Export PNG**: download a snapshot via the floating action button

### Visualizing the Task Graph

Add `--graph` to any task command to visualize the task execution plan instead of running it:

```bash
nx build my-app --graph
nx run-many -t build --graph
nx affected -t build --graph
```

Task graph nodes display:
- Executor details
- Input configurations
- Computation hash information
- Required task completion sequencing

## Parallel Execution

### Controlling Concurrency

The `--parallel` flag controls how many tasks run simultaneously. It accepts a number or `false` for sequential execution.

```bash
# Default: 3 concurrent tasks
nx run-many -t test

# Run 5 tasks in parallel
nx run-many -t test --parallel=5

# Sequential execution (1 at a time)
nx run-many -t test --parallel=false
# or equivalently:
nx run-many -t test --parallel=1
```

### Setting Defaults in `nx.json`

```jsonc
{
  "parallel": 4
}
```

### Continuous Tasks

Some tasks (like `serve` or `watch`) run continuously. When mixing continuous and finite tasks in a pipeline, Nx starts continuous tasks last and does not wait for them to complete before considering the pipeline done.

## Terminal UI

Nx 21+ includes an interactive terminal UI (`--outputStyle=tui`, the default) that allows you to:

- Choose which task's output to display during execution
- Search through the task list
- View multiple task outputs side by side

Use `--outputStyle=stream` for traditional streaming output (useful in CI where TUI is not appropriate).
