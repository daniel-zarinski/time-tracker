---
title: "Nx TypeScript Project Linking and Libraries"
source:
  - url: "https://nx.dev/docs/concepts/typescript-project-linking"
    title: "TypeScript Project Linking | Nx"
  - url: "https://nx.dev/docs/concepts/buildable-and-publishable-libraries"
    title: "Publishable and Buildable Nx Libraries | Nx"
  - url: "https://nx.dev/nx-api/js/generators/library"
    title: "@nx/js:library Generator | Nx"
  - url: "https://nx.dev/docs/technologies/typescript/guides/switch-to-workspaces-project-references"
    title: "Switch to Workspaces and Project References | Nx"
  - url: "https://nx.dev/docs/features/enforce-module-boundaries"
    title: "Enforce Module Boundaries | Nx"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, typescript, libraries, buildable, publishable, project-references]
---

# Nx TypeScript Project Linking and Libraries

## Overview

Nx provides first-class support for TypeScript monorepos by managing how projects reference each other, how shared libraries are structured, and how module boundaries are enforced. In Nx 22, the recommended approach is package manager workspaces combined with TypeScript project references, replacing the older tsconfig path-alias approach. Libraries can be plain workspace libraries, buildable (pre-compiled), or publishable (bundled for npm distribution).

## TypeScript Project Linking

Nx supports two mechanisms for linking TypeScript projects so that imports like `import { foo } from '@myorg/shared'` resolve correctly without relative paths.

### Package Manager Workspaces (Recommended in Nx 22)

This is the modern approach. Each package manager has its own workspace declaration syntax.

**npm / yarn / bun** — root `package.json`:

```json
{
  "workspaces": ["apps/*", "libs/*"]
}
```

**pnpm** — root `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "libs/*"
```

Each library's `package.json` defines its name and entry point:

```json
{
  "name": "@myorg/shared-ui",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Applications that consume the library list it as a dependency with a workspace version specifier:

```json
{
  "dependencies": {
    "@myorg/shared-ui": "*"
  }
}
```

Use `"workspace:*"` for yarn, pnpm, and bun. Use `"*"` for npm.

### TypeScript Path Aliases (Legacy)

The older approach uses `paths` in the root `tsconfig.base.json` to map import names to source files:

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "paths": {
      "@myorg/shared-ui": ["libs/shared-ui/src/index.ts"]
    }
  }
}
```

**Limitation:** If a project's own `tsconfig.*.json` defines its own `paths`, those overwrite the root paths entirely — all root mappings are lost for that project.

This approach does not benefit from TypeScript incremental compilation and is being phased out in Nx 22 in favor of workspaces + project references.

## tsconfig Configuration

### Root Files

Nx 22 workspaces use three levels of tsconfig:

**`tsconfig.base.json`** — shared compiler options for the whole repo:

```jsonc
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "strict": true
    // No "paths" when using workspaces approach
  }
}
```

**`tsconfig.json`** (root) — editor entry point that references every project:

```jsonc
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "./apps/my-app" },
    { "path": "./libs/shared-ui" }
  ]
}
```

The empty `"files": []` is intentional — it tells TypeScript the root config itself compiles nothing; all source lives in referenced projects.

### Per-Project tsconfig

Each project has a set of tsconfig files:

**`tsconfig.json`** — project-level aggregator:

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

**`tsconfig.lib.json`** — production source, references dependencies:

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/libs/shared-ui",
    "types": []
  },
  "include": ["src/**/*.ts"],
  "references": [
    { "path": "../../libs/other-dep/tsconfig.lib.json" }
  ]
}
```

**`tsconfig.spec.json`** — test files:

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": ["src/**/*.spec.ts"],
  "references": [
    { "path": "./tsconfig.lib.json" }
  ]
}
```

### Automatic Sync with `nx sync`

Register the `@nx/js/typescript` plugin in `nx.json` to enable automatic project reference synchronization:

```jsonc
// nx.json
{
  "plugins": ["@nx/js/typescript"]
}
```

Running `nx sync` (or being prompted automatically during `nx build` / `nx serve`) keeps all `tsconfig.json` references consistent with the actual dependency graph. Without this, references go stale as the graph evolves.

**Performance impact of TypeScript project references:**
- Memory usage drops from ~6 GB to ~1 GB for large repos
- Subsequent type-check runs drop from ~186 s to ~25 s via `.tsbuildinfo` incremental caching

## Buildable Libraries

A **buildable library** is a workspace library that also has a `build` target, allowing it to be compiled independently before the apps that consume it are built.

### When to Use

- You want Nx incremental build caching to pre-compile shared libraries
- The library is consumed by multiple apps and changes infrequently
- You want to validate that the library compiles in isolation

### Generating a Buildable Library

```bash
nx g @nx/js:lib libs/shared-utils --bundler=tsc --buildable
```

Or for a React component library:

```bash
nx g @nx/react:lib libs/ui-components --bundler=vite --buildable
```

The `--bundler` option accepts: `tsc` (default), `swc`, `rollup`, `vite`, `esbuild`.

### What Gets Generated

- `project.json` with a `build` target using the selected executor
- `tsconfig.lib.json` configured for compilation output to `dist/`
- The library can only depend on other **buildable** libraries to fully benefit from incremental builds

### Build Executor Example

```jsonc
// project.json for a buildable library
{
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared-utils",
        "main": "libs/shared-utils/src/index.ts",
        "tsConfig": "libs/shared-utils/tsconfig.lib.json"
      }
    }
  }
}
```

## Publishable Libraries

A **publishable library** extends the buildable concept with bundling and packaging optimized for distribution on npm.

### When to Use

- The library will be consumed by projects **outside** the monorepo
- You need a clean public API with a versioned npm package
- The library is part of an organizational design system or utility package

### Generating a Publishable Library

The `--importPath` flag is required and sets the npm package name:

```bash
nx g @nx/js:lib libs/my-design-system \
  --publishable \
  --importPath=@myorg/my-design-system \
  --bundler=rollup
```

### Publishing Workflow

Building produces the distributable in `dist/`:

```bash
nx build my-design-system
```

Then publish manually or via CI:

```bash
cd dist/libs/my-design-system
npm publish
```

Nx release tooling (via `nx release`) can automate versioning and publishing. The `--publishable` flag configures the library to be compatible with `nx release`.

### Generated `package.json` for Published Library

```json
{
  "name": "@myorg/my-design-system",
  "version": "0.0.1",
  "main": "./index.js",
  "typings": "./index.d.ts",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

## Buildable vs Publishable: Key Differences

| Concern | Buildable | Publishable |
|---------|-----------|-------------|
| Primary audience | Internal monorepo apps | External npm consumers |
| `--importPath` required | No | Yes |
| Bundling optimization | Minimal (tsc output) | Full (tree-shaking, CJS + ESM) |
| Incremental builds | Yes | Yes |
| `nx release` support | No | Yes |
| Generates `build` target | Yes | Yes |
| Default bundler | `tsc` | `rollup` or `vite` |

**Decision rule:** If the library stays inside the repo, use `--buildable`. If it needs to be published to a registry for external consumers, use `--publishable --importPath=<npm-name>`.

Plain workspace libraries (neither flag) have only `lint` and `test` targets — no compilation step — and are resolved from TypeScript source directly.

## Library Generators

### `@nx/js:lib`

The framework-agnostic TypeScript library generator:

```bash
nx g @nx/js:lib <directory> [options]
```

Key options:

| Option | Default | Description |
|--------|---------|-------------|
| `--buildable` | `true` | Add a build target |
| `--publishable` | `false` | Configure for `nx release` publishing |
| `--importPath` | — | npm package name (required with `--publishable`) |
| `--bundler` | `tsc` | `tsc`, `swc`, `rollup`, `vite`, `esbuild`, or `none` |
| `--strict` | `true` | Enable TypeScript strict mode |
| `--unitTestRunner` | jest | `jest` or `vitest` |
| `--linter` | eslint | Lint tool |
| `--minimal` | `false` | Skip README generation |
| `--tags` | — | Comma-separated tags for module boundary rules |

Example — minimal internal utility library with SWC and vitest:

```bash
nx g @nx/js:lib libs/core-utils \
  --bundler=swc \
  --unitTestRunner=vitest \
  --tags=scope:shared \
  --minimal
```

### `@nx/react:lib`

React-specific library generator, accepts the same buildable/publishable flags:

```bash
nx g @nx/react:lib libs/ui-kit \
  --bundler=vite \
  --publishable \
  --importPath=@myorg/ui-kit \
  --unitTestRunner=vitest \
  --tags=scope:shared,type:ui
```

## Code Sharing Patterns

### Barrel Exports (`index.ts`)

Every library exposes its public API through a single entry point. Generators create `src/index.ts` automatically:

```typescript
// libs/shared-utils/src/index.ts
export { formatDate } from './lib/format-date';
export { parseAmount } from './lib/parse-amount';
export type { DateRange } from './lib/types';
```

Only symbols exported from `index.ts` are part of the public API. Internal modules that are not exported here are considered private.

### Importing Across Projects

Once linked (via workspaces or path aliases), any project imports from the package name:

```typescript
// In any app or library
import { formatDate } from '@myorg/shared-utils';
```

Do not use relative paths across project boundaries (e.g., `../../libs/shared-utils/src/lib/format-date`). This bypasses the public API contract and breaks when projects are moved.

### Enforce Module Boundaries

The `@nx/enforce-module-boundaries` ESLint rule enforces tag-based dependency constraints. Tags are declared in `project.json` or `package.json`:

```jsonc
// libs/shared-utils/project.json
{
  "tags": ["scope:shared", "type:util"]
}
```

Constraints are configured in the root ESLint config (flat config example):

```javascript
// eslint.config.mjs
import nxPlugin from '@nx/eslint-plugin';

export default [
  {
    plugins: { '@nx': nxPlugin },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          depConstraints: [
            {
              sourceTag: 'scope:feature',
              onlyDependOnLibsWithTags: ['scope:feature', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
];
```

Setting `enforceBuildableLibDependency: true` prevents non-buildable libraries from importing buildable ones, preserving the integrity of incremental build chains.

**Tag strategy example for a time-tracker monorepo:**

| Tag | Meaning |
|-----|---------|
| `scope:electron` | Electron main-process code |
| `scope:renderer` | Frontend/renderer code |
| `scope:shared` | Framework-agnostic utilities |
| `type:feature` | Feature slice library |
| `type:ui` | UI component library |
| `type:data` | Data access / IPC layer |
| `type:util` | Pure utility functions |

Electron main-process code (`scope:electron`) should never import renderer-only code (`scope:renderer`). Shared utilities (`scope:shared`) should not import from either scope.
