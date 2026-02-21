---
title: "@nx/react — React Plugin for Nx 22"
source:
  - url: "https://nx.dev/nx-api/react"
    title: "@nx/react API Reference | Nx"
  - url: "https://nx.dev/nx-api/react/generators/application"
    title: "@nx/react:application Generator | Nx"
  - url: "https://nx.dev/nx-api/react/generators/library"
    title: "@nx/react:library Generator | Nx"
  - url: "https://nx.dev/nx-api/react/generators/component"
    title: "@nx/react:component Generator | Nx"
  - url: "https://nx.dev/docs/technologies/react/generators"
    title: "@nx/react Generators Overview | Nx"
  - url: "https://nx.dev/docs/technologies/build-tools/webpack/guides/webpack-config-setup"
    title: "Configure Webpack in your Nx workspace | Nx"
  - url: "https://nx.dev/getting-started/tutorials/react-monorepo-tutorial"
    title: "React Monorepo Tutorial | Nx"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [nx, react, generators, webpack, testing, electron]
---

# @nx/react — React Plugin for Nx 22

## Overview

`@nx/react` is the official Nx plugin for React applications and libraries. It provides generators for scaffolding React apps, shared libraries, and components inside an Nx monorepo, along with executors that wire up build, serve, test, and lint targets automatically. For this project, the webpack bundler is **required** (not Vite) because `nx-electron` depends on webpack-based build output.

## Installing @nx/react

Install the plugin as a dev dependency. The major version must match the installed Nx major version — Nx 22 requires `@nx/react@22`.

```bash
npm install -D @nx/react@22
```

If you are creating a new workspace and select React as the framework during `create-nx-workspace`, the plugin is installed automatically. For an existing workspace, install it manually and then run generators as needed.

Verify the installed versions are in sync:

```bash
npx nx report
```

## App Generator

The app generator scaffolds a full React application including build, serve, test, and lint targets.

### Basic usage

```bash
nx g @nx/react:application apps/my-app
```

### Key options

| Option | Default | Description |
|--------|---------|-------------|
| `--bundler` | `vite` | Build tool. Use `webpack` for nx-electron compatibility. |
| `--compiler` | `babel` | JS compiler (`babel` or `swc`). |
| `--style` | `css` | Stylesheet format (`css`, `scss`, `less`, `styled-components`, `none`). |
| `--routing` | `false` | Scaffold routing infrastructure (adds React Router). |
| `--unitTestRunner` | `none` | Testing framework (`jest`, `vitest`, or `none`). |
| `--e2eTestRunner` | `playwright` | E2E framework (`playwright`, `cypress`, or `none`). |
| `--strict` | `true` | Enable strict TypeScript checking. |
| `--port` | `4200` | Dev server port. |
| `--minimal` | `false` | Skip test files and extra boilerplate. |

### Webpack app for nx-electron

Because `nx-electron` wraps a webpack-built frontend, always pass `--bundler=webpack` when generating the React app that will run inside Electron:

```bash
nx g @nx/react:application apps/renderer \
  --bundler=webpack \
  --style=scss \
  --routing \
  --unitTestRunner=jest \
  --e2eTestRunner=none
```

### Generated structure

```
apps/renderer/
  src/
    app/
      app.tsx          # Root component
      app.module.scss
      app.spec.tsx
    assets/
    main.tsx           # Entry point
    styles.scss
  project.json         # Nx project targets (build, serve, test, lint)
  tsconfig.app.json
  tsconfig.spec.json
  webpack.config.js    # Present when bundler=webpack
  .eslintrc.json
apps/renderer-e2e/     # Only if e2eTestRunner != none
```

## Library Generator

Libraries hold shared code (UI components, utilities, data-access logic) consumed by one or more apps. They enforce clean dependency boundaries via Nx module boundary rules.

### Basic usage

```bash
nx g @nx/react:library libs/ui
```

### Key options

| Option | Default | Description |
|--------|---------|-------------|
| `--buildable` | `false` | Emit compiled output via rollup so the lib can be pre-built. |
| `--publishable` | — | Like buildable, but also configures `package.json` for npm publishing. |
| `--importPath` | — | NPM import name, e.g. `@myorg/ui` (required when publishable). |
| `--bundler` | `none` | `none` = non-buildable; `rollup` for buildable/publishable. |
| `--component` | `true` | Generate a default component inside the library. |
| `--style` | `css` | Stylesheet format. |
| `--unitTestRunner` | `none` | Testing framework. |
| `--routing` | `false` | Add routing support inside the library. |
| `--tags` | — | Comma-separated tags for module boundary linting (e.g., `scope:shared,type:ui`). |

### Shared code patterns

For an Electron project, a common library split is:

```bash
# Shared UI components consumed by the renderer
nx g @nx/react:library libs/ui --component --style=scss --unitTestRunner=jest

# Shared TypeScript types/utilities (no React dependency)
nx g @nx/js:library libs/shared-types
```

Libraries expose their public API through a barrel export file:

```typescript
// libs/ui/src/index.ts
export { Button } from './lib/button/button';
export { Header } from './lib/header/header';
```

Apps import from the library path alias, never from a deep file path:

```typescript
// apps/renderer/src/app/app.tsx
import { Button } from '@myorg/ui';
```

Nx enforces these boundaries with ESLint rules configured in `.eslintrc.json` at the root.

## Component Generator

The component generator creates a single React component with optional test and style files.

### Basic usage

```bash
nx g @nx/react:component libs/ui/src/lib/button/button
```

Alias: `nx g @nx/react:c`

### Key options

| Option | Default | Description |
|--------|---------|-------------|
| `--path` | required | File path where the component is created. |
| `--name` | (path segment) | Exported symbol name; defaults to the final path segment. |
| `--style` | `css` | Stylesheet format. |
| `--export` | `false` | Re-export from the project's `index.ts` barrel automatically. |
| `--classComponent` | `false` | Generate class-based instead of functional component. |
| `--globalCss` | `false` | Use `*.css` instead of `*.module.css`. |
| `--skipTests` | `false` | Skip generating a `spec.tsx` file. |

### Example — button in a shared UI library

```bash
nx g @nx/react:component libs/ui/src/lib/button/button \
  --name=Button \
  --style=scss \
  --export
```

This creates:

```
libs/ui/src/lib/button/
  button.tsx
  button.module.scss
  button.spec.tsx
```

And, because `--export` was passed, updates `libs/ui/src/index.ts`:

```typescript
export { Button } from './lib/button/button';
```

## Project Structure

An Nx React monorepo separates code into **apps** and **libs**:

```
time-tracker/
  apps/
    renderer/          # @nx/react app (webpack) — shown in the Electron window
    electron/          # nx-electron app — main process
  libs/
    ui/                # Shared React components
    shared-types/      # Shared TypeScript interfaces (no framework)
  nx.json
  package.json
  tsconfig.base.json   # Path aliases for all libraries
```

### App vs lib boundary

- **Apps** are deployment targets. They are never imported by other projects.
- **Libs** are reusable modules. They are imported by apps and by other libs.

Path aliases for libs are configured in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@myorg/ui": ["libs/ui/src/index.ts"],
      "@myorg/shared-types": ["libs/shared-types/src/index.ts"]
    }
  }
}
```

Nx enforces the boundary rule that apps cannot import from other apps, and libs cannot import upward into apps, using the `@nx/enforce-module-boundaries` ESLint rule.

## Routing — Hash-Based Routing for Electron

Electron loads the renderer via the `file://` protocol, which makes standard browser history routing (`BrowserRouter`) non-functional. All React Router navigation must use **hash-based routing**.

### React Router v6 with HashRouter

```bash
npm install react-router-dom
```

```typescript
// apps/renderer/src/main.tsx
import { HashRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
```

```typescript
// apps/renderer/src/app/app.tsx
import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
```

With `HashRouter`, the URL looks like `file:///path/to/index.html#/settings`, which Electron handles correctly without a web server.

Alternatively, use `createHashRouter` from React Router v6:

```typescript
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
  { path: '/', element: <Home /> },
  { path: '/settings', element: <Settings /> },
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);
```

## Testing

### Jest (recommended for webpack projects)

When generating an app or library with `--unitTestRunner=jest`, Nx configures Jest automatically with `ts-jest` (TypeScript support) and `@testing-library/react`.

Run tests:

```bash
nx test renderer
nx test ui
```

Run a single test file:

```bash
nx test renderer --testFile=apps/renderer/src/app/app.spec.tsx
```

Run only affected tests (useful in CI):

```bash
nx affected --target=test
```

### Example component test

```typescript
// libs/ui/src/lib/button/button.spec.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Vitest (alternative, Vite projects only)

Vitest is supported for `--bundler=vite` projects. Because this project uses webpack for Electron compatibility, Jest is the appropriate choice. Do not mix Vitest with webpack-bundled apps.

### Test configuration files

Jest configuration is generated in `apps/renderer/project.json` under the `test` target and uses `jest.config.ts` at the project root. The root `jest.preset.js` (generated by Nx) is extended by each project's config:

```typescript
// apps/renderer/jest.config.ts
export default {
  displayName: 'renderer',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/renderer',
};
```

## Webpack Configuration

`@nx/react` ships two approaches for webpack integration.

### NxReactWebpackPlugin (default for new apps)

When `--bundler=webpack` is used, the generator produces a `webpack.config.js` using `NxReactWebpackPlugin`:

```javascript
// apps/renderer/webpack.config.js
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/renderer'),
  },
  devServer: {
    port: 4200,
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      styles: ['./src/styles.scss'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
    }),
    new NxReactWebpackPlugin({
      // svgr: false  // uncomment to disable SVG-as-component support
    }),
  ],
};
```

### composePlugins / withReact (legacy / advanced)

The older composable plugin API is still valid and required for advanced use cases such as Module Federation:

```javascript
// apps/renderer/webpack.config.js
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(
  withNx(),
  withReact(),
  (config) => {
    // Custom modifications to the webpack config here
    return config;
  }
);
```

When using `composePlugins`, set `isolatedConfig: true` in `project.json` so Nx does not attempt to apply plugins a second time:

```json
// apps/renderer/project.json (build target)
{
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "options": {
        "isolatedConfig": true,
        "webpackConfig": "apps/renderer/webpack.config.js"
      }
    }
  }
}
```

### Custom webpack extensions

To extend the generated config without replacing it entirely, add logic after the plugin calls:

```javascript
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Example: add a custom alias
  config.resolve.alias = {
    ...config.resolve.alias,
    '@assets': require('path').resolve(__dirname, 'src/assets'),
  };
  return config;
});
```

This approach keeps all Nx and React defaults intact while allowing targeted overrides.
