---
title: "Zustand DevTools Integration"
source:
  - url: "https://zustand.docs.pmnd.rs/middlewares/devtools"
    title: "devtools - Zustand"
  - url: "https://github.com/pmndrs/zustand/blob/main/src/middleware/devtools.ts"
    title: "zustand/src/middleware/devtools.ts"
  - url: "https://github.com/MarshallOfSound/electron-devtools-installer"
    title: "electron-devtools-installer - GitHub"
  - url: "https://www.electronjs.org/docs/latest/tutorial/devtools-extension"
    title: "DevTools Extension - Electron Documentation"
  - url: "https://deepwiki.com/pmndrs/zustand/3-middleware-system"
    title: "Middleware System - Zustand DeepWiki"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [zustand, devtools, redux-devtools, electron, middleware, debugging]
---

# Zustand DevTools Integration

## Overview

Zustand ships a built-in `devtools` middleware that connects any Zustand store to the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools), enabling state inspection, action logging, and time-travel debugging. In Electron, the extension must be installed into the `BrowserWindow` session — typically via `electron-devtools-installer` — since Electron does not load user Chrome extensions automatically.

## The `devtools` Middleware

### Basic Usage

Wrap your store initializer with `devtools()` imported from `zustand/middleware`:

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()(
  devtools(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by })),
    }),
    { name: 'BearStore' }  // appears as the connection name in Redux DevTools
  )
)
```

### Configuration Options

The second argument to `devtools()` accepts a `DevtoolsOptions` object:

```typescript
interface DevtoolsOptions {
  name?: string              // Label shown in Redux DevTools connection list
  enabled?: boolean          // Default: true in dev, false in production
  anonymousActionType?: string  // Label for unnamed set() calls (default: 'anonymous')
  store?: string             // Namespace for multi-store scenarios
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `name` | `undefined` | Identifies this store's connection in Redux DevTools |
| `enabled` | `true` in dev | Set to `false` to disable devtools entirely |
| `anonymousActionType` | `'anonymous'` | Fallback action type label when no name is provided |
| `store` | `undefined` | Groups stores in DevTools; use with `name` for multi-store |

### Conditional Enabling

Only enable devtools in development to avoid overhead in production builds:

```typescript
// Using process.env.NODE_ENV (works in renderer with webpack/vite)
const useStore = create<MyState>()(
  devtools(
    (set) => ({ /* ... */ }),
    {
      name: 'MyStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)
```

In Electron, you can also use `app.isPackaged` from the main process (pass it to the renderer via IPC or `contextBridge` if needed):

```typescript
// In renderer — passed from main via preload
const isDev = !window.__APP_CONFIG__.isPackaged

const useStore = create<MyState>()(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'MyStore', enabled: isDev }
  )
)
```

## Named Actions

### Naming Individual Actions

Pass a string as the **third argument** to `set()` to label that action in the Redux DevTools action log. This makes the action history much more readable:

```typescript
const useTimerStore = create<TimerState>()(
  devtools(
    (set) => ({
      elapsed: 0,
      isRunning: false,
      start: () => set({ isRunning: true }, false, 'timer/start'),
      stop:  () => set({ isRunning: false }, false, 'timer/stop'),
      reset: () => set({ elapsed: 0, isRunning: false }, false, 'timer/reset'),
      tick:  () =>
        set(
          (state) => ({ elapsed: state.elapsed + 1 }),
          false,
          'timer/tick'
        ),
    }),
    { name: 'TimerStore', anonymousActionType: 'timer/unknown' }
  )
)
```

> **`set(state, replace, actionName)`** — The second argument is the `replace` flag (whether to replace the entire state instead of merging). Pass `false` to keep merge behavior (the default). The third argument is the action name shown in DevTools.

### Action Name as an Object

The third argument can also be an object with `type` and optional payload for richer logging:

```typescript
increase: (by: number) =>
  set(
    (state) => ({ bears: state.bears + by }),
    false,
    { type: 'bear/increase', payload: by }
  )
```

### Default for Unnamed Updates (`anonymousActionType`)

If you call `set()` without naming it, the label in DevTools falls back to:
1. The caller function name detected from the stack trace (when available)
2. The `anonymousActionType` option value
3. `'anonymous'` (hardcoded fallback)

Set `anonymousActionType` to a meaningful string so untracked updates are still identifiable:

```typescript
devtools(initializer, { name: 'MyStore', anonymousActionType: 'myStore/unknown' })
```

## Multiple Stores in DevTools

When you have multiple Zustand stores, use a distinct `name` and optionally `store` for each so they appear as separate connections in Redux DevTools:

```typescript
const useSessionStore = create<SessionState>()(
  devtools(sessionInit, { name: 'App', store: 'session' })
)

const useTimerStore = create<TimerState>()(
  devtools(timerInit, { name: 'App', store: 'timer' })
)

const useSettingsStore = create<SettingsState>()(
  devtools(settingsInit, { name: 'App', store: 'settings' })
)
```

With `name: 'App'` and separate `store` values, all three appear under a single `App` connection. Use the **Store Selector** dropdown in Redux DevTools to switch between them.

## Middleware Composition

### Ordering Rules

**`devtools` should be the outermost middleware.** This ensures it captures every state mutation from inner middlewares (persist, immer, subscribeWithSelector) and sends accurate diffs to Redux DevTools.

```typescript
// Correct ordering: devtools > persist > immer
const useStore = create<MyState>()(
  devtools(
    persist(
      immer((set) => ({
        count: 0,
        increment: () => set((state) => { state.count++ }),
      })),
      { name: 'my-store' }  // persist storage key
    ),
    { name: 'MyStore' }     // devtools connection name
  )
)
```

### With `subscribeWithSelector`

```typescript
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'

const useStore = create<MyState>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      })),
      { name: 'my-store' }
    ),
    { name: 'MyStore', enabled: process.env.NODE_ENV === 'development' }
  )
)
```

### TypeScript with Composed Middleware

When composing multiple middleware in TypeScript, the type inference stacks correctly via mutator identifiers. If you encounter type errors, use explicit generics:

```typescript
import { StateCreator } from 'zustand'
import { devtools, DevtoolsOptions } from 'zustand/middleware'

const useStore = create<MyState>()(
  devtools<
    MyState,
    [['zustand/devtools', never], ['zustand/persist', MyState]]
  >(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
)
```

In practice, TypeScript inference usually works without explicit mutator types for 2–3 middleware layers.

## What Redux DevTools Provides

When connected, Redux DevTools gives you:

| Feature | Description |
|---------|-------------|
| **Action Log** | Chronological list of every `set()` call with its action name |
| **State Diff** | Shows exactly what changed between states |
| **State Inspector** | Browse the full current state as a tree |
| **Time Travel** | Jump back to any previous state |
| **Commit** | Collapse history to current state |
| **Rollback** | Revert to the last committed state |
| **Import/Export** | Save and restore state snapshots |

## Installing Redux DevTools in Electron

Electron does not load user-installed Chrome extensions automatically. You must programmatically install Redux DevTools into the Electron session.

### Using `electron-devtools-installer` (Recommended)

```bash
npm install electron-devtools-installer --save-dev
```

In the Electron **main process** (`apps/desktop/src/main.ts`):

```typescript
import { app, BrowserWindow } from 'electron'
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer'

app.whenReady().then(async () => {
  if (!app.isPackaged) {
    // Install Redux DevTools only in development
    await installExtension(REDUX_DEVTOOLS, {
      loadExtensionOptions: { allowFileAccess: true }, // required for file:// URLs
    })
      .then((ext) => console.log(`Installed extension: ${ext.name}`))
      .catch((err) => console.error('DevTools install failed:', err))
  }

  // Create BrowserWindow after extension is installed
  const win = new BrowserWindow({ /* ... */ })
  win.loadFile('dist/renderer/index.html')
})
```

> **`allowFileAccess: true`** is needed when the renderer is loaded via `file://` (Electron default). Without it, the DevTools extension cannot inspect the page.

### Installing Multiple Extensions

```typescript
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer'

await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
  loadExtensionOptions: { allowFileAccess: true },
})
```

### Manual Installation (Alternative)

If `electron-devtools-installer` is unavailable or blocked, load the extension from Chrome's local extension directory:

```typescript
import { app, session } from 'electron'
import path from 'node:path'
import os from 'node:os'

app.whenReady().then(async () => {
  if (!app.isPackaged) {
    // Replace [ext-id] and [version] with your local Redux DevTools values
    const extPath = path.join(
      os.homedir(),
      'Library/Application Support/Google/Chrome/Default/Extensions',
      '[ext-id]/[version]'
    )
    await session.defaultSession.loadExtension(extPath)
  }
})
```

> Extensions loaded this way are **not persisted** between app launches — they must be reloaded every time.

## Custom Logging Middleware

For lightweight debugging without Redux DevTools, write a simple logging middleware:

```typescript
import { StateCreator, StoreMutatorIdentifier } from 'zustand'

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>

const loggerImpl: Logger = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    set(...(args as Parameters<typeof set>))
    console.log(`[${name ?? 'store'}] state:`, get())
  }
  return f(loggedSet, get, store)
}

export const logger = loggerImpl as Logger

// Usage
const useBearStore = create<BearState>()(
  logger(
    (set) => ({
      bears: 0,
      increase: (by) => set((state) => ({ bears: state.bears + by })),
    }),
    'BearStore'
  )
)
```

This logs every state change to the browser console without any external dependencies.

## Practical Example: Timer Store with DevTools + Persist

A complete example using both `devtools` and `persist`, with named actions and conditional enabling:

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface TimerState {
  elapsed: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
  tick: () => void
}

const isDev = process.env.NODE_ENV === 'development'

export const useTimerStore = create<TimerState>()(
  devtools(
    persist(
      (set) => ({
        elapsed: 0,
        isRunning: false,
        start: () =>
          set({ isRunning: true }, false, 'timer/start'),
        stop: () =>
          set({ isRunning: false }, false, 'timer/stop'),
        reset: () =>
          set({ elapsed: 0, isRunning: false }, false, 'timer/reset'),
        tick: () =>
          set(
            (state) => ({ elapsed: state.elapsed + 1 }),
            false,
            'timer/tick'
          ),
      }),
      {
        name: 'timer-store',          // localStorage key
        partialize: (state) => ({     // only persist elapsed, not isRunning
          elapsed: state.elapsed,
        }),
      }
    ),
    {
      name: 'TimeTracker',            // Redux DevTools connection name
      store: 'timer',                 // store selector label
      enabled: isDev,
      anonymousActionType: 'timer/unknown',
    }
  )
)
```

See [persistence.md](./persistence.md) for full details on the `persist` middleware and storage adapters.
