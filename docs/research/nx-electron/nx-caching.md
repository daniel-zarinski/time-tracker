---
title: "Nx Caching — How It Works Internally"
source:
  - url: "https://nx.dev/docs/concepts/how-caching-works"
    title: "How Caching Works — Nx Documentation"
  - url: "https://nx.dev/features/cache-task-results"
    title: "Cache Task Results — Nx Documentation"
  - url: "https://nx.dev/docs/concepts/mental-model"
    title: "Nx Mental Model — Nx Documentation"
  - url: "https://nx.dev/docs/reference/inputs"
    title: "Inputs and Named Inputs — Nx Documentation"
  - url: "https://nx.dev/docs/troubleshooting/troubleshoot-cache-misses"
    title: "Troubleshoot Cache Misses — Nx Documentation"
  - url: "https://nx.dev/docs/features/ci-features/remote-cache"
    title: "Remote Caching (Nx Replay) — Nx Documentation"
  - url: "https://nx.dev/docs/reference/remote-cache-plugins/shared-fs-cache/overview"
    title: "Shared File System Cache Plugin — Nx Documentation"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, caching, performance, hash, inputs, outputs, named-inputs, remote-cache]
---

# Nx Caching — How It Works Internally

## Overview

Nx treats every task as a deterministic, pure function: identical inputs always produce identical outputs. Before running any task, Nx computes a **computation hash** (a unique fingerprint) from all declared inputs. If a prior result with that exact hash exists — locally or remotely — Nx replays the stored result instead of re-executing the task. This document covers the internal mechanics of that process. For basic caching configuration (enabling cache, `inputs`/`outputs` syntax, `skipNxCache`) see `nx-task-running.md`.

## Cache Hash Computation

The computation hash is a single deterministic fingerprint that uniquely identifies a task invocation. Nx calculates it before executing the task, then uses it as a cache key.

### What Goes Into the Hash

By default, the hash for a task like `nx test remixapp` incorporates:

| Input category | Example |
|---|---|
| Source files of the project | All files matched by `inputs` globs |
| Source files of dependencies | Transitively included via `dependentTasksOutputFiles` or project graph |
| Relevant global configuration | `nx.json`, `tsconfig.base.json` |
| External dependency versions | Hash of the resolved versions of `node_modules` packages |
| Runtime values | Node.js version, custom scripts |
| CLI command flags | Flags passed to the underlying npm script (not Nx-internal flags) |

Nx does **not** hash what the developer literally types. `nx build myapp` and `nx run myapp:build` produce the same hash; Nx-level flags like `--parallel` and `--graph` are never included. Only flags forwarded to the underlying script (e.g., `--prod`) affect the hash.

### Hash Computation Is Per-Task

When you run `nx run-many -t build`, each project gets its own independently computed hash. Projects that have not changed get a cache hit; changed projects get a cache miss and re-run — even in the same command invocation.

## Named Inputs

Named inputs allow you to define reusable, composable sets of inputs that can be referenced by name in `targetDefaults` or individual project targets. They are the primary mechanism for avoiding duplication and expressing intent.

### Workspace-Level Definition (`nx.json`)

```jsonc
{
  "namedInputs": {
    "sharedGlobals": [
      { "runtime": "node --version" }
    ],
    "default": [
      "{projectRoot}/**/*",
      "sharedGlobals"
    ],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/jest.config.ts",
      "!{projectRoot}/.eslintrc.json"
    ]
  }
}
```

### Project-Level Override (`project.json` or `package.json`)

A project can define or override a named input with the same name. The project-level definition wins for that project only:

```jsonc
{
  "namedInputs": {
    "production": [
      "default",
      "!{projectRoot}/**/*.stories.tsx"
    ]
  }
}
```

### Reference Syntax

| Syntax | Meaning |
|---|---|
| `"production"` | Named input from the current project |
| `"^production"` | Named input from all dependency projects |
| `{ "input": "production", "projects": "mylib" }` | Named input from a specific named project |

### Convention: `default` and `production`

- **`default`** — All project files plus `sharedGlobals`. Used as a catch-all; guarantees tasks re-run whenever any file changes.
- **`production`** — Subset of `default` excluding test files, stories, and developer tooling config. Used for tasks that only care about production-affecting source. A `build` that depends on `"^production"` from its dependencies will not cache-miss when a dep's test file changes.
- **`sharedGlobals`** — Workspace-wide factors (Node version, OS, global env vars). Adding an item here causes every task to include it in its hash.

## Runtime Inputs

Runtime inputs execute a command and include its stdout in the hash. This is how Nx captures tool versions that change independently of source files.

```jsonc
{
  "namedInputs": {
    "sharedGlobals": [
      { "runtime": "node --version" },
      { "runtime": "node -e \"process.version\"" }
    ]
  }
}
```

Commands must be cross-platform Node invocations where possible. The output is captured and hashed; if the Node version changes between runs, every task that includes `sharedGlobals` gets a cache miss. Runtime inputs should live in `sharedGlobals` so they apply universally rather than being repeated per target.

### Environment Variable Inputs

Environment variables are captured by value, not by name:

```jsonc
{
  "targets": {
    "build": {
      "inputs": [
        "production",
        { "env": "NODE_ENV" },
        { "env": "API_BASE_URL" }
      ]
    }
  }
}
```

If `NODE_ENV` changes from `development` to `production`, any task that includes `{ "env": "NODE_ENV" }` will cache-miss. Variables not listed in `inputs` are ignored entirely — they do not affect the hash.

## External Dependencies

### Default Behavior

If no `externalDependencies` input is specified for a task, Nx includes the hashed versions of **all** external workspace dependencies. This is safe but coarse: adding any package (even an unrelated devDependency) invalidates the cache for every task.

### Explicit `externalDependencies`

Declaring specific packages makes the hash more precise:

```jsonc
{
  "targetDefaults": {
    "build": {
      "inputs": [
        "production",
        { "externalDependencies": ["vite", "typescript"] }
      ]
    },
    "test": {
      "inputs": [
        "default",
        { "externalDependencies": ["jest", "@jest/globals"] }
      ]
    }
  }
}
```

Nx hashes the resolved version strings of the listed packages from `node_modules`. Only version changes to those specific packages trigger a cache miss. Bumping an unrelated package (e.g., a documentation tool) no longer invalidates the `build` cache.

### Dependent Task Outputs

For builds that consume compiled output from dependencies (e.g., `.d.ts` files), use `dependentTasksOutputFiles` instead of raw source globs:

```jsonc
{
  "targets": {
    "build": {
      "inputs": [
        "production",
        {
          "dependentTasksOutputFiles": "**/*.d.ts",
          "transitive": true
        }
      ]
    }
  }
}
```

This tells Nx to include the matching output files from all dependent project builds in the hash, rather than their source. This is more precise: changes to a library's internal implementation that don't alter its public API (`.d.ts`) no longer bust the consumer's cache.

## Cache Restoration

When a hash match is found, Nx replays the cached result without executing the task. Restoration has two parts:

1. **Terminal output replay** — The stored stdout/stderr is streamed to the terminal, making a cache hit visually indistinguishable from a live run. All logs, warnings, and error messages are reproduced.
2. **Output file restoration** — Files listed in the target's `outputs` property are copied from the cache back to their original locations (e.g., `dist/`, `coverage/`). Downstream tasks that depend on those files find them in place.

### `.nx/cache` Directory Structure

The local cache lives in `.nx/cache` by default (configurable via `cacheDirectory` in `nx.json` or the `NX_CACHE_DIRECTORY` environment variable). Each cache entry is keyed by its computation hash. The directory contains:

- The terminal output log for that hash
- The output files (artifacts) snapshotted at the time of the original run
- Metadata linking the hash to the task identity

Cache entries are retained for **one week** before automatic deletion.

### Changing the Cache Location

```jsonc
// nx.json
{
  "cacheDirectory": "/tmp/my-nx-cache"
}
```

Or via environment variable (useful in CI):

```bash
NX_CACHE_DIRECTORY=/mnt/shared-cache nx run-many -t build
```

## Local vs. Remote Cache

### Local Cache

The local cache (`~/.nx/cache` or project-local `.nx/cache`) is the first lookup. It is implicitly trusted: Nx will not re-run a task if a matching hash is found locally. Because the local cache is machine-specific, it provides no benefit across CI runs or between team members without remote caching.

Nx detects if a cache entry was created on a **different machine** and issues an "Unknown Local Cache" warning — a security signal that the cache may have been externally injected.

### Remote Cache (Nx Replay)

Nx Cloud's remote caching layer is consulted after a local miss. The workflow is:

1. Nx computes the hash.
2. Local cache is checked — hit returns immediately.
3. On a local miss, Nx queries Nx Cloud for a matching remote entry.
4. On a remote hit, Nx downloads the entry to local cache and replays it.
5. On a remote miss, Nx executes the task, then uploads the result to both local cache and Nx Cloud.

This means a build completed in CI can be replayed instantly by any developer whose local inputs match, with no re-execution.

### Connecting to Nx Cloud

```bash
npx nx@latest connect
```

This configures `nx.json` with an `nxCloudId` and installs the Nx Cloud runner.

### Access Control

Nx Cloud supports fine-grained token-based access:

| Token type | Capability |
|---|---|
| Read-write | Can populate the remote cache (typically CI only) |
| Read-only | Can consume from the remote cache (developer machines) |

This prevents untrusted machines from poisoning the shared cache with bad entries.

### Security: End-to-End Encryption

Artifacts are encrypted before transmission to Nx Cloud and decrypted on retrieval. Nx Cloud staff cannot access task output content. For compliance-sensitive environments, self-hosted and EU-region deployments are available.

### Self-Hosted Alternative: `@nx/shared-fs-cache`

For teams that cannot use Nx Cloud, the `@nx/shared-fs-cache` plugin allows using a shared file system path (e.g., a network drive or CI cache mount) as a pseudo-remote cache:

```bash
nx add @nx/shared-fs-cache
```

The plugin treats the configured `cacheDirectory` as both local and remote. The actual sharing mechanism (syncing the directory) is left to the team's infrastructure.

## Cache Troubleshooting

### Step 1: Verify the Task Is Cacheable

```bash
nx show project <project-name> --web
```

This opens the Project Details View in a browser. Confirm the target shows a **Cacheable** badge. If not, ensure `cache: true` is set in `targetDefaults` or the project's `project.json`.

### Step 2: Inspect Declared Inputs

Check `nx.json#targetDefaults` and the project's own `project.json`/`package.json` for the `inputs` array. Cross-reference against `namedInputs` to understand the full set of files and variables that feed the hash.

### Step 3: Identify Which Files Feed the Hash

```bash
nx graph --file=output.json
```

Then inspect `output.json` — each project entry lists the files that contribute to its project graph and therefore to its input set. This helps catch unexpected files being included.

### Step 4: Use Nx Cloud's Compare Feature

After connecting to Nx Cloud, every run prints a run-details URL. In Nx Cloud:

1. Navigate to the task with the cache miss.
2. Click **Compare to similar tasks**.
3. Nx Cloud highlights which inputs differ between the two runs (based on hash comparison, not source diff, since Nx Cloud never stores source code).

### Common Pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Non-deterministic build output | Cache hit never replays correctly; artifacts differ between runs | Ensure the task produces identical output given identical inputs (no timestamps, random IDs in output) |
| Missing `outputs` declaration | Artifact files not restored on cache hit | Add all output directories/files to `outputs` in the target config |
| Unintentional file inclusion | Cache misses on unrelated changes (e.g., README edits) | Exclude irrelevant files with `!` patterns in `inputs` |
| Undeclared environment variable dependency | Task silently uses an env var that isn't in `inputs` | Add `{ "env": "VAR_NAME" }` to the target's `inputs` |
| Over-broad `externalDependencies` (default) | Any package version bump busts all caches | Declare specific packages in `{ "externalDependencies": [...] }` |
| E2E tests hitting live APIs | Cache returns stale results for tests that depend on external state | Do not set `cache: true` for tasks with non-deterministic external dependencies |
| Outputs written outside declared paths | Cache hit does not restore files used by downstream tasks | Audit the task's file writes and expand `outputs` accordingly |

### Verbose Logging

```bash
NX_VERBOSE_LOGGING=true nx build my-app
```

This surfaces additional detail about hash computation and cache lookup decisions during task execution.
