---
title: "Zustand Setup and Basics"
source:
  - url: "https://zustand.docs.pmnd.rs/getting-started/introduction"
    title: "Zustand: Introduction"
  - url: "https://zustand.docs.pmnd.rs/getting-started/comparison"
    title: "Zustand: Comparison"
  - url: "https://github.com/pmndrs/zustand"
    title: "GitHub - pmndrs/zustand: Bear necessities for state management in React"
  - url: "https://zustand.docs.pmnd.rs/guides/beginner-typescript"
    title: "Beginner TypeScript Guide - Zustand"
  - url: "https://zustand.docs.pmnd.rs/apis/create-store"
    title: "createStore - Zustand"
  - url: "https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow"
    title: "Prevent rerenders with useShallow - Zustand"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [zustand, state-management, react, typescript, electron]
---

# Zustand Setup and Basics

## Overview

Zustand is a lightweight (~1–3 KB), minimalist state management library for React that avoids reducers, context providers, and boilerplate. Its hook-based API lets you read and write global state from any component — or from outside React entirely — making it a natural fit for Electron apps where state may need to be shared across multiple renderer contexts.

## Installation

```bash
npm install zustand
```

Zustand has no peer dependencies beyond React (18+). It ships its own TypeScript types — no `@types/*` package needed.

## Creating a Basic Store

A Zustand store is created with `create()`. The factory function receives `set` (and optionally `get`) and returns the initial state plus actions.

```typescript
import { create } from 'zustand'

interface BearStore {
  bears: number
  increasePopulation: () => void
  removeAllBears: () => void
}

const useBearStore = create<BearStore>()((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))
```

Key points:
- `create<BearStore>()` — the double-call `()()` is required in TypeScript to let the compiler infer types correctly (curried form).
- State and actions live in the same object — no reducers or action creators.
- `set` accepts either a partial state object or an updater function `(prevState) => partialState`.

## TypeScript Usage

### Typing State and Actions Together

The recommended pattern is to define a single interface that includes both state fields and action functions:

```typescript
interface TimerState {
  elapsed: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

const useTimerStore = create<TimerState>()((set) => ({
  elapsed: 0,
  isRunning: false,
  start: () => set({ isRunning: true }),
  stop:  () => set({ isRunning: false }),
  reset: () => set({ elapsed: 0, isRunning: false }),
}))
```

### Separating State and Actions Types

For larger stores you may want to separate the shapes:

```typescript
type TimerState = {
  elapsed: number
  isRunning: boolean
}

type TimerActions = {
  start: () => void
  stop: () => void
  reset: () => void
}

const useTimerStore = create<TimerState & TimerActions>()((set) => ({
  elapsed: 0,
  isRunning: false,
  start: () => set({ isRunning: true }),
  stop:  () => set({ isRunning: false }),
  reset: () => set({ elapsed: 0, isRunning: false }),
}))
```

### Extracting the Store Type

You can extract the inferred state type from an existing store using `typeof`:

```typescript
type StoreState = ReturnType<typeof useTimerStore.getState>
```

## Using Stores in React Components

The return value of `create()` is a React hook. Call it inside any component — no `Provider` wrapper needed.

```tsx
function BearCounter() {
  // Subscribes this component to `bears` only
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>Add bear</button>
}
```

Components re-render only when the selected slice changes — not on every store update.

## Selectors to Avoid Unnecessary Re-renders

By default, Zustand uses strict equality (`===`) to detect changes. Always select the minimum slice of state a component needs.

### Single-value selector (recommended)

```tsx
// Re-renders only when `bears` changes
const bears = useBearStore((state) => state.bears)
```

### Multiple values — use `useShallow`

Selecting multiple values as a new object each render would always be referentially unequal, causing unnecessary re-renders. Use `useShallow` to compare shallowly:

```tsx
import { useShallow } from 'zustand/react/shallow'

function StatusPanel() {
  const { elapsed, isRunning } = useTimerStore(
    useShallow((state) => ({ elapsed: state.elapsed, isRunning: state.isRunning }))
  )
  return <div>{isRunning ? elapsed : 'Stopped'}</div>
}
```

### Derived values

Compute derived state inside the selector — Zustand will only re-render if the result changes:

```tsx
const isOverBudget = useTimerStore((state) => state.elapsed > 3600)
```

## Subscribing Outside React

Zustand stores expose a vanilla API that works entirely outside the React tree. This is useful in Electron main-process logic, IPC handlers, or non-React utilities.

### Accessing state imperatively

```typescript
// Read current state
const currentBears = useBearStore.getState().bears

// Write state
useBearStore.setState({ bears: 5 })
useBearStore.setState((state) => ({ bears: state.bears + 1 }))
```

### Subscribing to changes

```typescript
// Subscribe to ALL store changes
const unsubscribe = useBearStore.subscribe((state) => {
  console.log('Bears changed to', state.bears)
})

// Call unsubscribe() when done to avoid memory leaks
unsubscribe()
```

### Vanilla store (no React dependency)

For code that should have no React dependency at all (e.g., a shared module used by both the main and renderer processes), create a vanilla store with `createStore`:

```typescript
import { createStore } from 'zustand/vanilla'

const bearStore = createStore<BearStore>()((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))

// Access the same vanilla store from React via useStore
import { useStore } from 'zustand'

function BearCounter() {
  const bears = useStore(bearStore, (state) => state.bears)
  return <h1>{bears}</h1>
}
```

## Why Zustand for Electron Apps

| Concern | Zustand | Redux | React Context |
|---------|---------|-------|---------------|
| Bundle size | ~1–3 KB | ~40 KB (RTK) | 0 (built-in) |
| Provider required | No | Yes | Yes |
| Outside-React access | Yes (`getState`/`setState`) | Yes (dispatch) | No |
| Multiple renderer support | Yes (vanilla store shared) | Possible | No |
| Boilerplate | Minimal | High | Low–medium |

Key advantages for Electron:
- **No Provider** — works immediately inside `BrowserWindow` renderers without wrapping the app.
- **Vanilla store** — the same store instance can be referenced from the main process or preload script for direct state inspection without IPC round-trips.
- **Multiple renderers** — when Electron opens multiple `BrowserWindow`s with separate React trees, a shared vanilla store can bridge both renderers. No other React-specific state manager supports this pattern.
- **Tiny footprint** — critical for Electron bundles where every KB affects startup time.

## Summary

| API | Purpose |
|-----|---------|
| `create<T>()((set, get) => ...)` | Create a typed store hook |
| `useStore((state) => state.field)` | Subscribe a component to a state slice |
| `useShallow(selector)` | Shallow-compare multi-value selections |
| `useStore.getState()` | Read state outside React |
| `useStore.setState(partial)` | Write state outside React |
| `useStore.subscribe(listener)` | React to changes outside React |
| `createStore` from `zustand/vanilla` | Create a store with no React dependency |
