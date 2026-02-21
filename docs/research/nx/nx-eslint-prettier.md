---
title: "Nx 22 ESLint and Prettier Configuration"
source:
  - url: "https://nx.dev/nx-api/eslint"
    title: "@nx/eslint API Reference"
  - url: "https://nx.dev/nx-api/eslint/executors/lint"
    title: "Lint Executor Reference"
  - url: "https://nx.dev/nx-api/eslint/generators/configuration"
    title: "ESLint Configuration Generator"
  - url: "https://nx.dev/features/enforce-module-boundaries"
    title: "Enforce Module Boundaries"
  - url: "https://nx.dev/recipes/enforce-module-boundaries"
    title: "Module Boundaries Recipes"
  - url: "https://prettier.io/docs/en/install"
    title: "Prettier Installation Guide"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, nx-22, eslint, prettier, linting, module-boundaries, flat-config]
---

# Nx 22 ESLint and Prettier Configuration

## Overview

Nx 22 integrates ESLint via the `@nx/eslint` plugin, which provides lint executors and generators for setting up consistent linting across all projects in a workspace. Nx 22 uses ESLint's **flat config** format (`eslint.config.js` / `eslint.config.mjs`) by default. Prettier is installed separately and integrated with ESLint via `eslint-config-prettier` to prevent rule conflicts.

## @nx/eslint Plugin

### Installation

The `@nx/eslint` plugin is typically installed automatically when adding ESLint to a workspace. To add it manually:

```bash
nx add @nx/eslint
```

### What the Plugin Provides

- **`@nx/eslint:lint` executor** — Runs ESLint on a project's files with Nx caching support
- **Generators** — Set up ESLint flat config, create workspace-level custom rules, convert from legacy `.eslintrc` format
- **Inferred tasks** — Automatically infer `lint` tasks from `eslint.config.js` files without requiring explicit executor configuration

## ESLint Flat Config (Nx 22 Default)

Nx 22 generates ESLint flat config files (`eslint.config.js` or `eslint.config.mjs`) by default. The old `.eslintrc.json` format is considered legacy.

### Workspace Root Config

The root `eslint.config.js` applies to the entire workspace:

```javascript
const { FlatCompat } = require('@eslint/eslintrc');
const nxEslintPlugin = require('@nx/eslint-plugin');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  { plugins: { '@nx': nxEslintPlugin } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            { sourceTag: '*', onlyDependOnLibsWithTags: ['*'] },
          ],
        },
      ],
    },
  },
  ...compat.extends('plugin:@nx/typescript'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    ...compat.extends('plugin:@nx/javascript'),
    rules: {},
  },
];
```

### Per-Project Config

Each project has its own `eslint.config.js` that extends the workspace root config:

```javascript
const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
];
```

### Converting from Legacy `.eslintrc`

If your workspace still uses `.eslintrc.json`, convert to flat config using the generator:

```bash
nx generate @nx/eslint:convert-to-flat-config
```

Options:
- `--skipFormat` (boolean, default: `false`) — Skip auto-formatting after conversion

## Lint Executor

The `@nx/eslint:lint` executor runs ESLint on a project's files with full Nx caching support.

### Basic `project.json` Configuration

```json
{
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint",
      "options": {
        "lintFilePatterns": [
          "apps/my-app/**/*.ts",
          "apps/my-app/**/*.tsx"
        ]
      },
      "outputs": ["{options.outputFile}"]
    }
  }
}
```

### Executor Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lintFilePatterns` | array | `["{projectRoot}"]` | Files, directories, or globs to lint |
| `cache` | boolean | `false` | Only check modified files |
| `cacheLocation` | string | — | Path for the ESLint cache file |
| `cacheStrategy` | string | `"metadata"` | How to detect changed files: `metadata` or `content` |
| `fix` | boolean | `false` | Auto-fix detected issues |
| `force` | boolean | `false` | Exit with code 0 even if there are lint errors |
| `format` | string | `"stylish"` | Output formatter (e.g., `stylish`, `json`, `compact`) |
| `quiet` | boolean | `false` | Show errors only, suppress warnings |
| `silent` | boolean | `false` | Suppress all output |
| `outputFile` | string | — | Write results to a file |
| `maxWarnings` | number | `-1` | Maximum allowed warnings before failing |
| `eslintConfig` | string | — | Path to a custom ESLint config file |
| `hasTypeAwareRules` | boolean | — | Invalidate cache on TypeScript dependency changes |
| `reportUnusedDisableDirectives` | string | — | Report unused `// eslint-disable` comments |

### Running the Lint Executor

```bash
# Lint a single project
nx lint my-app

# Auto-fix issues
nx lint my-app --fix

# Lint all projects
nx run-many -t lint

# Lint affected projects only
nx affected -t lint

# Lint with output to file
nx lint my-app --outputFile=lint-results.json

# Cache lint results (only re-lint changed files)
nx lint my-app --cache
```

### Bulk Suppression (ESLint v9.24.0+)

For large codebases with many pre-existing warnings, bulk suppression can be configured in the executor options:

```json
{
  "options": {
    "suppressAll": true,
    "suppressionsLocation": "./eslint-suppressions.json"
  }
}
```

Or suppress specific rules only:

```json
{
  "options": {
    "suppressRule": ["@typescript-eslint/no-explicit-any", "no-console"]
  }
}
```

## Prettier Setup

Prettier is installed separately from ESLint and integrated to handle code formatting.

### Installation

```bash
# Install Prettier (pin exact version for consistency)
npm install --save-dev --save-exact prettier

# Install eslint-config-prettier to disable conflicting ESLint rules
npm install --save-dev eslint-config-prettier
```

### `.prettierrc` Configuration

Create a `.prettierrc` file in the workspace root:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2
}
```

Create `.prettierignore` to exclude files from formatting:

```
dist
node_modules
.nx
coverage
```

### Integrating Prettier with ESLint

Add `eslint-config-prettier` to the ESLint config to disable all rules that conflict with Prettier:

```javascript
// eslint.config.js
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  // ... other config
  eslintConfigPrettier,  // Must be last — disables formatting-related rules
];
```

> `eslint-config-prettier` disables ESLint formatting rules that would conflict with Prettier. It does NOT run Prettier; it only prevents ESLint from complaining about Prettier-formatted code.

### Running Prettier

```bash
# Format all files
npx prettier --write .

# Check formatting without modifying files (useful in CI)
npx prettier --check .

# Format specific files
npx prettier --write "apps/**/*.ts"
```

## Workspace-Wide Linting

### Lint All Projects

```bash
# Run lint across all projects (respects task pipeline)
nx run-many -t lint

# Run lint on affected projects only
nx affected -t lint

# Run with parallel workers
nx run-many -t lint --parallel=5

# Stop on first failure
nx run-many -t lint --nxBail
```

### Caching Lint Results

Nx caches lint results automatically when `cache: true` is set in `targetDefaults`:

```json
// nx.json
{
  "targetDefaults": {
    "lint": {
      "cache": true
    }
  }
}
```

## Module Boundary Rules

### What `@nx/enforce-module-boundaries` Does

The `@nx/enforce-module-boundaries` ESLint rule prevents TypeScript imports that violate declared architectural boundaries between projects. When a project tagged `scope:client` tries to import from a project tagged `scope:admin`, ESLint produces an error.

### Installing Required Packages

```bash
nx add @nx/eslint-plugin @nx/devkit
```

### Tag-Based Configuration

Assign tags to projects in `project.json`:

```json
{
  "tags": ["scope:shared", "type:util"]
}
```

Configure constraints in the workspace `eslint.config.js`:

```javascript
{
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        allow: [],
        depConstraints: [
          // scope:shared can only depend on other scope:shared
          {
            sourceTag: 'scope:shared',
            onlyDependOnLibsWithTags: ['scope:shared']
          },
          // scope:client can depend on scope:shared or scope:client
          {
            sourceTag: 'scope:client',
            onlyDependOnLibsWithTags: ['scope:shared', 'scope:client']
          },
          // scope:admin can depend on scope:shared or scope:admin
          {
            sourceTag: 'scope:admin',
            onlyDependOnLibsWithTags: ['scope:shared', 'scope:admin']
          },
        ],
      },
    ],
  },
}
```

### Tag Format Options

| Format | Example | Matches |
|--------|---------|---------|
| Exact string | `"scope:client"` | Only that exact tag |
| Wildcard | `"*"` | Any tag (or no tag) |
| Regex | `"/^scope.*/"` | Any tag matching the pattern |
| Glob | `"scope:*"` | Any tag starting with `scope:` |

### Checking for Violations

```bash
# Lint will check module boundary violations
nx lint my-app
nx run-many -t lint
```

A violation produces an error like:
```
A project tagged with 'scope:admin' can only depend on projects tagged with 'scope:shared' or 'scope:admin'.
```

### `enforceBuildableLibDependency`

When `enforceBuildableLibDependency: true`, buildable libraries (those with a `build` target) cannot import from non-buildable libraries. This enforces proper package boundaries for publishable libraries.

## Editor Integration

### VS Code: ESLint Extension

Install the **ESLint** extension (`dbaeumer.vscode-eslint`) and configure workspace settings:

```json
// .vscode/settings.json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### VS Code: Prettier Extension

Install the **Prettier - Code formatter** extension (`esbenp.prettier-vscode`) and configure:

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Recommended `.vscode/extensions.json`

Check this file into the repo to recommend extensions to all contributors:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

## Custom Workspace Rules

Create custom ESLint rules scoped to your workspace using the generator:

```bash
nx generate @nx/eslint:workspace-rule my-custom-rule
```

This scaffolds a rule in `tools/eslint-rules/` that can be referenced in your ESLint config.

## Quick Reference

```bash
# Lint a single project
nx lint my-app

# Auto-fix linting issues
nx lint my-app --fix

# Lint all projects
nx run-many -t lint

# Lint affected projects only
nx affected -t lint

# Check Prettier formatting (no changes)
npx prettier --check .

# Fix Prettier formatting
npx prettier --write .

# Convert from .eslintrc to flat config
nx generate @nx/eslint:convert-to-flat-config

# Add custom workspace lint rule
nx generate @nx/eslint:workspace-rule my-rule-name
```
