---
title: "Zustand Persistence for Electron"
source:
  - url: "https://zustand.docs.pmnd.rs/middlewares/persist"
    title: "persist - Zustand"
  - url: "https://zustand.docs.pmnd.rs/integrations/persisting-store-data"
    title: "Persisting store data - Zustand"
  - url: "https://github.com/pmndrs/zustand"
    title: "GitHub - pmndrs/zustand: Bear necessities for state management in React"
  - url: "https://github.com/sindresorhus/electron-store"
    title: "GitHub - sindresorhus/electron-store: Simple data persistence for your Electron app"
  - url: "https://www.electronjs.org/docs/latest/api/safe-storage"
    title: "safeStorage | Electron"
  - url: "https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware"
    title: "persist Middleware - pmndrs/zustand - DeepWiki"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [zustand, persistence, electron, electron-store, middleware, state-management]
---

# Zustand Persistence for Electron

## Overview

Zustand's `persist` middleware enables automatic state persistence across app restarts. In a browser context, it defaults to `localStorage`; for Electron, we can replace this with a custom storage adapter backed by `electron-store`, which writes a JSON file to the OS-specific user data directory. This gives us native file-system persistence with versioning, migration, and encryption support.

## The `persist` Middleware

### Basic usage

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark'
  language: string
  setTheme: (theme: 'light' | 'dark') => void
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings',                          // storage key name
      storage: createJSONStorage(() => localStorage), // default; swap for Electron
    }
  )
)
```

The `persist` middleware wraps the store initializer. On startup, it reads the persisted JSON from the configured storage and merges it (shallowly by default) into the initial state.

### Full configuration reference

```typescript
persist(initializer, {
  // Required
  name: 'my-store',

  // Storage backend (default: localStorage)
  storage: createJSONStorage(() => someStorageObject),

  // Persist only a subset of state
  partialize: (state) => ({ field1: state.field1, field2: state.field2 }),

  // Custom merge strategy (default: shallow merge)
  merge: (persistedState, currentState) => ({ ...currentState, ...persistedState }),

  // Schema version for migrations
  version: 1,

  // Migration function: receives old state and old version number
  migrate: (persistedState, version) => {
    if (version === 0) {
      // Transform v0 → v1
    }
    return persistedState
  },

  // Called before/after hydration
  onRehydrateStorage: (state) => {
    console.log('Hydration starting...')
    return (state, error) => {
      if (error) console.error('Hydration failed:', error)
      else console.log('Hydration complete')
    }
  },

  // Skip auto-hydration (call store.persist.rehydrate() manually)
  skipHydration: false,
})
```

## Partial Persistence (`partialize`)

Use `partialize` to persist only the fields that should survive a restart. Transient UI state (loading flags, modal open/close, current route) should not be persisted.

```typescript
interface TimerState {
  // Persist these
  projects: Project[]
  totalElapsed: number
  // Do NOT persist
  isRunning: boolean
  currentTick: number
}

const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      projects: [],
      totalElapsed: 0,
      isRunning: false,      // transient — excluded
      currentTick: 0,        // transient — excluded
      // ... actions
    }),
    {
      name: 'timer',
      partialize: (state) => ({
        projects: state.projects,
        totalElapsed: state.totalElapsed,
        // isRunning and currentTick are not included → not persisted
      }),
    }
  )
)
```

## Versioning and Migration

When the data model changes between releases, the `version` and `migrate` options handle schema upgrades. If the stored version doesn't match `version`, Zustand calls `migrate` with the old state before hydrating.

```typescript
interface SettingsV2 {
  appearance: { theme: 'light' | 'dark'; fontSize: number }
  language: string
}

const useSettingsStore = create<SettingsV2>()(
  persist(
    (set) => ({
      appearance: { theme: 'light', fontSize: 14 },
      language: 'en',
    }),
    {
      name: 'settings',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 1) {
          // v0 had a flat `theme` field; v1 introduced `appearance`
          persistedState.appearance = { theme: persistedState.theme ?? 'light' }
          delete persistedState.theme
        }
        if (version < 2) {
          // v1 had no fontSize; v2 adds it with a default
          persistedState.appearance.fontSize = 14
        }
        return persistedState as SettingsV2
      },
    }
  )
)
```

**Important:** increment `version` whenever you change the persisted shape. If you forget, old data may fail to parse or silently produce wrong defaults.

## Hydration

### Hydration timing

- **Synchronous storage** (e.g., `localStorage`): Hydration completes synchronously during store creation. Components mounted in the same render cycle already have the persisted values.
- **Asynchronous storage** (e.g., a file-backed adapter using IPC): The store starts with default values and updates asynchronously after the persisted data is read. Components should handle the interim state gracefully.

### Tracking hydration with `onRehydrateStorage`

```typescript
interface StoreState {
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  // ... other fields
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'my-store',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// In a component — wait for hydration before rendering
function App() {
  const hasHydrated = useStore((state) => state._hasHydrated)
  if (!hasHydrated) return <SplashScreen />
  return <MainApp />
}
```

### Manual hydration

For SSR or advanced Electron scenarios (e.g., waiting for the main process to be ready), disable auto-hydration and call it explicitly:

```typescript
const useStore = create()(
  persist(..., { skipHydration: true })
)

// Later, once IPC is ready:
useStore.persist.rehydrate()
```

## Electron-Specific Persistence with `electron-store`

### Why `electron-store`?

- Stores data in `app.getPath('userData')` — the OS-appropriate user data directory
- Writes an atomic JSON file; resistant to corruption on crash
- Supports dot-notation access, TypeScript generics, and schema validation (via `ajv`)
- Works in both main and renderer processes

**Storage locations:**
| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/<App Name>/` |
| Windows | `%APPDATA%/<App Name>/` |
| Linux | `~/.config/<App Name>/` |

### Installing

```bash
npm install electron-store
```

> **Note:** `electron-store` ≥9 is native ESM only. If the renderer bundle uses CommonJS, use dynamic `import()` or configure Webpack to handle ESM.

### Creating a custom storage adapter

The `persist` middleware expects a storage object with `getItem`, `setItem`, and `removeItem`. We wrap `electron-store` to implement this interface.

The adapter should live in the **main process** or in a **preload script** exposed via IPC, because `electron-store` accesses the file system directly and cannot run in the renderer's sandboxed context.

#### Option A — Use in main process / preload (not sandboxed)

```typescript
// preload/store-adapter.ts
import Store from 'electron-store'
import { StateStorage } from 'zustand/middleware'

const fileStore = new Store({ name: 'zustand-state' })

export const electronStoreAdapter: StateStorage = {
  getItem: (name: string): string | null => {
    return (fileStore.get(name) as string) ?? null
  },
  setItem: (name: string, value: string): void => {
    fileStore.set(name, value)
  },
  removeItem: (name: string): void => {
    fileStore.delete(name)
  },
}
```

Then use it in any Zustand store that can import from the preload context:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { electronStoreAdapter } from '../preload/store-adapter'

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'settings',
      storage: createJSONStorage(() => electronStoreAdapter),
    }
  )
)
```

#### Option B — IPC-based adapter (sandboxed renderer)

If the renderer is sandboxed, expose the storage operations via IPC:

```typescript
// main/ipc-store.ts
import Store from 'electron-store'
import { ipcMain } from 'electron'

const fileStore = new Store({ name: 'zustand-state' })

ipcMain.handle('store:get', (_event, key: string) => fileStore.get(key) ?? null)
ipcMain.handle('store:set', (_event, key: string, value: string) => fileStore.set(key, value))
ipcMain.handle('store:delete', (_event, key: string) => fileStore.delete(key))
```

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronStore', {
  getItem: (key: string) => ipcRenderer.invoke('store:get', key),
  setItem: (key: string, value: string) => ipcRenderer.invoke('store:set', key, value),
  removeItem: (key: string) => ipcRenderer.invoke('store:delete', key),
})
```

```typescript
// renderer — IPC storage adapter (async)
import { StateStorage, createJSONStorage } from 'zustand/middleware'

const ipcStorage: StateStorage = {
  getItem: async (name: string) => window.electronStore.getItem(name),
  setItem: async (name: string, value: string) => window.electronStore.setItem(name, value),
  removeItem: async (name: string) => window.electronStore.removeItem(name),
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'settings',
      storage: createJSONStorage(() => ipcStorage),
      // IPC is async — the store starts with defaults then hydrates
    }
  )
)
```

> When using an async adapter, always track `_hasHydrated` (see [Hydration](#hydration)) to avoid rendering stale defaults.

## Complete Example

A production-ready timer store with file-backed persistence:

```typescript
// stores/timer-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { electronStoreAdapter } from '../preload/store-adapter'

interface Project {
  id: string
  name: string
  totalSeconds: number
}

interface TimerState {
  // Persisted
  projects: Project[]
  activeProjectId: string | null
  // Transient (not persisted)
  isRunning: boolean
  _hasHydrated: boolean
  // Actions
  addProject: (name: string) => void
  setActiveProject: (id: string) => void
  logTime: (projectId: string, seconds: number) => void
  start: () => void
  stop: () => void
  setHasHydrated: (v: boolean) => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,
      isRunning: false,
      _hasHydrated: false,
      addProject: (name) =>
        set((state) => ({
          projects: [...state.projects, { id: crypto.randomUUID(), name, totalSeconds: 0 }],
        })),
      setActiveProject: (id) => set({ activeProjectId: id }),
      logTime: (projectId, seconds) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, totalSeconds: p.totalSeconds + seconds } : p
          ),
        })),
      start: () => set({ isRunning: true }),
      stop: () => set({ isRunning: false }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'timer',
      version: 1,
      storage: createJSONStorage(() => electronStoreAdapter),
      // Only persist stable data — never transient UI flags
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      migrate: (persisted: any, version: number) => {
        if (version < 1) {
          // v0 stored time as `elapsed` on the store root; v1 moves it into projects
          persisted.projects = []
          delete persisted.elapsed
        }
        return persisted
      },
    }
  )
)
```

## Encryption Considerations

For stores containing sensitive data (API tokens, credentials), do **not** store values in plain JSON. Two options:

### Option 1 — Electron `safeStorage` API

`safeStorage` uses the OS keychain/credential store to encrypt a buffer:

```typescript
// main process only
import { safeStorage } from 'electron'

function encryptValue(plaintext: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS encryption unavailable')
  }
  return safeStorage.encryptString(plaintext).toString('base64')
}

function decryptValue(ciphertext: string): string {
  return safeStorage.decryptString(Buffer.from(ciphertext, 'base64'))
}
```

Encrypt before writing to `electron-store`, decrypt after reading. Use IPC to expose these operations to the renderer.

Platform notes:
- **macOS**: Uses the system Keychain; may prompt the user for access.
- **Windows**: Uses DPAPI — protects from other OS users, not other apps in the same user session.
- **Linux**: Uses kwallet / gnome-libsecret; falls back to a hardcoded key if no secret store is available (less secure).

### Option 2 — `electron-store` built-in encryption

`electron-store` accepts an `encryptionKey` option, which uses AES-256-CBC. This is simpler but the key must be hardcoded in the app bundle (less secure than `safeStorage`).

```typescript
const secureStore = new Store({
  name: 'secure',
  encryptionKey: process.env.STORE_KEY ?? 'fallback-key', // avoid hardcoding in production
})
```

> For truly sensitive credentials (OAuth tokens, API keys), prefer `safeStorage` over a hardcoded encryption key.

## Summary

| Concern | Approach |
|---------|----------|
| Basic persistence | `persist` middleware with `createJSONStorage` |
| Electron file storage | Custom adapter wrapping `electron-store` |
| Sandboxed renderer | IPC adapter exposing `getItem`/`setItem`/`removeItem` |
| Partial persistence | `partialize` option — exclude transient fields |
| Schema upgrades | `version` + `migrate` — increment version on every shape change |
| Hydration tracking | `onRehydrateStorage` + `_hasHydrated` flag |
| Sensitive data | `safeStorage.encryptString()` in main process via IPC |
