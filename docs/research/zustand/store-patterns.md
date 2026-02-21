---
title: "Zustand Store Patterns and Best Practices"
source:
  - url: "https://zustand.docs.pmnd.rs/guides/slices-pattern"
    title: "Slices Pattern - Zustand"
  - url: "https://zustand.docs.pmnd.rs/guides/how-to-reset-state"
    title: "How to reset state - Zustand"
  - url: "https://zustand.docs.pmnd.rs/guides/auto-generating-selectors"
    title: "Auto Generating Selectors - Zustand"
  - url: "https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions"
    title: "Practice with no store actions - Zustand"
  - url: "https://github.com/pmndrs/zustand/discussions/2496"
    title: "When should we be using multiple stores instead of a single store with separate slices?"
  - url: "https://github.com/pmndrs/zustand"
    title: "GitHub - pmndrs/zustand"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [zustand, state-management, patterns, typescript, electron, slices, selectors]
---

# Zustand Store Patterns and Best Practices

## Overview

Zustand is intentionally unopinionated about store structure, but the community has converged on a set of patterns that scale well: the **slices pattern** for organizing large stores, explicit **selector functions** for performance, and a consistent **reset pattern** for clearing state. This file covers architectural decisions and concrete patterns; for basic setup see `setup.md`.

## Single Store vs Multiple Stores

### Recommendation: one store, multiple slices

The Zustand maintainers recommend a single store for most applications. The primary reason: **cross-slice actions**. When an action needs to update state in two different domains simultaneously (e.g., stopping a timer and saving a project log entry at the same time), a single store makes that trivial with one `set()` call. Coordinating two separate stores requires subscribing each store to the other, which Zustand is not designed for.

**Use a single store with slices when:**
- Domains share state or need to trigger each other's actions
- You want a single `subscribe()` point for persistence or devtools
- Simplicity is preferred over micro-optimization

**Consider multiple stores when:**
- Two domains are completely isolated and will never interact
- You want tighter subscription scoping (multiple stores *can* be slightly more performant, but the difference is rarely meaningful)
- A library/plugin manages its own internal state

Rule of thumb (from the Zustand community): *"If they are slightly related, use a single store — because in the future you'll want an action to update both."*

## Slices Pattern

The slices pattern splits a large store into focused domain modules, each defined as a `StateCreator`, then merged into one store.

### Defining a slice

```typescript
import { StateCreator } from 'zustand'

// --- Timer slice ---
export type TimerSlice = {
  elapsed: number
  isRunning: boolean
  startTimer: () => void
  stopTimer: () => void
  tickTimer: () => void
}

export const createTimerSlice: StateCreator<
  TimerSlice & ProjectSlice,   // full store shape (for cross-slice access)
  [],
  [],
  TimerSlice                   // this slice's output shape
> = (set) => ({
  elapsed: 0,
  isRunning: false,
  startTimer: () => set({ isRunning: true }),
  stopTimer:  () => set({ isRunning: false }),
  tickTimer:  () => set((state) => ({ elapsed: state.elapsed + 1 })),
})
```

```typescript
// --- Project slice ---
export type ProjectSlice = {
  activeProjectId: string | null
  setProject: (id: string | null) => void
}

export const createProjectSlice: StateCreator<
  TimerSlice & ProjectSlice,
  [],
  [],
  ProjectSlice
> = (set) => ({
  activeProjectId: null,
  setProject: (id) => set({ activeProjectId: id }),
})
```

### Combining slices into one store

```typescript
import { create } from 'zustand'
import { createTimerSlice, TimerSlice } from './timerSlice'
import { createProjectSlice, ProjectSlice } from './projectSlice'

type AppStore = TimerSlice & ProjectSlice

export const useAppStore = create<AppStore>()((...args) => ({
  ...createTimerSlice(...args),
  ...createProjectSlice(...args),
}))
```

Components then consume only what they need:

```tsx
const elapsed = useAppStore((state) => state.elapsed)
const activeProject = useAppStore((state) => state.activeProjectId)
```

### Cross-slice access

Because the `set`/`get` functions in `StateCreator` always receive the **full** combined store type, a slice can read or update another slice's state:

```typescript
// Inside timerSlice — stop timer AND clear project selection
stopTimerAndClear: () => set({ isRunning: false, activeProjectId: null }),
```

## Selectors

See `setup.md` for the basics (`useShallow`, atomic selectors). Additional patterns:

### Auto-generating selectors

Manually writing `(state) => state.field` for every property gets repetitive. A `createSelectors` utility generates per-key selectors automatically:

```typescript
import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

function createSelectors<S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as Record<string, unknown>)[k] = () =>
      store((s) => s[k as keyof typeof s])
  }
  return store
}

// Usage
export const useAppStore = createSelectors(
  create<AppStore>()((...args) => ({
    ...createTimerSlice(...args),
    ...createProjectSlice(...args),
  }))
)

// In a component — no selector function needed
const elapsed = useAppStore.use.elapsed()
const startTimer = useAppStore.use.startTimer()
```

### Derived / computed state

Compute derived values inside selectors; Zustand only re-renders when the result changes:

```tsx
// Re-renders only when the derived boolean changes
const isOverOneHour = useAppStore((state) => state.elapsed > 3600)

// Format derived value
const formattedTime = useAppStore((state) => {
  const h = Math.floor(state.elapsed / 3600)
  const m = Math.floor((state.elapsed % 3600) / 60)
  const s = state.elapsed % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
```

## Actions: Inside vs Outside the Store

### Pattern 1 — Actions inside the store (recommended default)

Define actions as part of the store state. Actions are co-located with the state they modify; TypeScript ensures correctness.

```typescript
const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
}))
```

### Pattern 2 — Actions outside the store

For actions that don't need to be reactive hooks (e.g., called from IPC handlers, background timers, or utility modules), define them as plain functions that call `setState` directly:

```typescript
// timerActions.ts
import { useTimerStore } from './timerStore'

export const tickTimer = () =>
  useTimerStore.setState((s) => ({ elapsed: s.elapsed + 1 }))

export const resetTimer = () =>
  useTimerStore.setState({ elapsed: 0, isRunning: false })
```

This is useful in Electron where an `ipcMain` handler or a `setInterval` in a non-React context needs to update state without importing React hooks.

## Resetting State

### Single-store reset using `getInitialState()`

The cleanest way to reset a store to its defaults uses the `getInitialState()` method available on every store:

```typescript
const useTimerStore = create<TimerSlice>()((set, get, store) => ({
  elapsed: 0,
  isRunning: false,
  startTimer: () => set({ isRunning: true }),
  stopTimer:  () => set({ isRunning: false }),
  reset: () => set(store.getInitialState()),
}))

// Usage
useTimerStore.getState().reset()
```

### Explicit initialState object (simpler, less DRY)

```typescript
const initialState = { elapsed: 0, isRunning: false }

const useTimerStore = create<typeof initialState & { reset: () => void }>()((set) => ({
  ...initialState,
  reset: () => set(initialState),
}))
```

### Resetting all stores at once

Useful for "log out" or "new session" flows:

```typescript
const storeResetFns = new Set<() => void>()

const createResettableStore = <T>(stateCreator: StateCreator<T>) => {
  const store = create<T>()(stateCreator)
  const initialState = store.getInitialState()
  storeResetFns.add(() => store.setState(initialState, true))
  return store
}

export const resetAllStores = () => storeResetFns.forEach((reset) => reset())
```

## Suggested Store Structure for This Time Tracker App

Given the app's domain (tracking time against projects in an Electron app), here is a sensible slice-based decomposition:

| Slice | State | Key Actions |
|-------|-------|-------------|
| `timer` | `elapsed`, `isRunning`, `startedAt` | `startTimer`, `stopTimer`, `tickTimer`, `resetTimer` |
| `projects` | `projects[]`, `activeProjectId` | `setProject`, `addProject`, `removeProject` |
| `sessions` | `sessions[]` | `logSession`, `clearSessions` |
| `settings` | `darkMode`, `idleTimeout`, `autoSave` | `updateSetting` |
| `ui` | `sidebarOpen`, `currentView` | `toggleSidebar`, `setView` |

**File layout suggestion:**

```
libs/store/
  src/
    index.ts                 ← re-exports useAppStore + createSelectors
    appStore.ts              ← create() combining all slices
    slices/
      timerSlice.ts
      projectsSlice.ts
      sessionsSlice.ts
      settingsSlice.ts
      uiSlice.ts
```

## Best Practices Summary

1. **One store per app** — use slices to divide it into domains.
2. **Keep state minimal** — store only the canonical source of truth; derive the rest in selectors.
3. **Prefer atomic selectors** — `(state) => state.field` over `(state) => ({ a: state.a, b: state.b })` unless you use `useShallow`.
4. **Name actions as verbs** — `startTimer`, `addProject`, not `timer`, `project`.
5. **Reset via `getInitialState()`** — avoids duplication and stays in sync as types evolve.
6. **Actions outside store for non-React callers** — ideal for Electron IPC handlers and background intervals.
7. **Apply AHA (Avoid Hasty Abstractions)** — start with a flat store; introduce slices when maintaining it becomes difficult, not before.
