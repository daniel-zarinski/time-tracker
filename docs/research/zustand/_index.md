---
title: "Zustand State Management for React/Electron"
source:
  - url: "https://zustand.docs.pmnd.rs/"
    title: "Zustand Official Documentation"
  - url: "https://github.com/pmndrs/zustand"
    title: "Zustand GitHub Repository"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [zustand, state-management, react, electron, persistence, devtools]
---

# Zustand State Management for React/Electron

## Overview

Zustand is a lightweight, unopinionated state management library for React. This research covers how to effectively use Zustand in an Electron desktop application — from basic store setup through advanced patterns like store slicing, state persistence (with Electron-specific storage), DevTools integration, and cross-process IPC state synchronization between Electron's main and renderer processes.

## How It All Fits Together

### Reading Order

Start with **[setup.md](./setup.md)** to understand how Zustand stores work — the `create()` API, TypeScript patterns, selectors, and the vanilla store API for non-React code. This is foundational for everything else.

Next, read **[store-patterns.md](./store-patterns.md)** to decide on your store architecture. The key decision: **one store with slices** (recommended) vs multiple stores. The slices pattern lets you split domains (timer, projects, settings, UI) into separate files while keeping them in a single store — which matters because cross-slice actions (e.g., stopping a timer and logging a session simultaneously) become trivial. This file also suggests a concrete slice decomposition for a time-tracker app and a file layout under `libs/store/`.

Then read **[persistence.md](./persistence.md)** and **[devtools.md](./devtools.md)** — these are independent of each other but both build on setup and patterns. Persistence covers the `persist` middleware with a custom `electron-store` adapter (critical for Electron — `localStorage` works but isn't ideal for desktop apps). The two persistence patterns to understand are: **Option A** (direct adapter in preload, synchronous) and **Option B** (IPC-based adapter for sandboxed renderers, async — requires hydration tracking). DevTools covers wiring Redux DevTools into Electron via `electron-devtools-installer` and using named actions for readable debugging.

Finally, read **[electron-integration.md](./electron-integration.md)** — the most architecturally significant piece. It presents three IPC patterns with a clear recommendation: **Pattern 2 (main process as source of truth)** is the right choice for a time-tracker because the timer must continue ticking when windows are minimized or hidden. The main process owns the vanilla Zustand store, and the renderer maintains a mirror store that hydrates from IPC pushes. This file also covers multi-window sync, third-party bridge libraries (`@zubridge/electron`, `zutron`), and a concrete architecture table mapping each piece of state to the process that should own it.

### Middleware Composition Order

When combining middleware, the correct nesting is: **devtools → persist → immer** (outermost to innermost). DevTools must be outermost to capture all state mutations. See `devtools.md` for the full composition example.

### Key Architecture Decision

The central design choice for this app is **where state lives**:

| State | Owner | Reasoning |
|-------|-------|-----------|
| Timer (elapsed, running) | Main process | Must tick when window is hidden; drives tray badge |
| Session log | Main process | Persisted to disk via `electron-store` |
| Project list | Main process | Referenced by tray menu, mirrored to renderer |
| Settings | Main process (mirrored) | Main needs idle timeout; renderer needs theme |
| UI state (sidebar, view) | Renderer only | Pure display concern |

The renderer Zustand store acts as a **mirror** of the main-process store for shared state, plus owns its own UI-only state. Actions that affect shared state go through IPC; the main process applies changes and pushes updates back.

## Key Concepts

- **Store** — A Zustand store is a hook-based state container created with `create()`. No providers or context wrappers needed.
- **Vanilla Store** — Created with `createStore()` from `zustand/vanilla` — works without React, ideal for Electron's main process.
- **Slice** — A `StateCreator` function defining one domain's state + actions, combined with other slices via spread into a single store.
- **Middleware** — Composable wrappers: `devtools()`, `persist()`, `immer()`, `subscribeWithSelector()`. Nest from outermost to innermost.
- **Selectors** — Functions passed to the store hook `useStore((s) => s.field)` that minimize re-renders. Use `useShallow` for multi-value selections.
- **Persist middleware** — Serializes state to a storage backend. Supports `partialize` (persist only some fields), `version`/`migrate` (schema evolution), and custom storage adapters.
- **Electron IPC bridge** — Pattern where `store.subscribe()` in main pushes state via `webContents.send()`, and the renderer mirror store hydrates from `ipcRenderer.on()`.
- **Hydration** — The process of loading persisted state into a store on startup. Async adapters (IPC-based) require tracking `_hasHydrated` to avoid rendering stale defaults.

## File Index

| File | Description | Depends On |
|------|-------------|------------|
| `setup.md` | Installation, basic store creation, TypeScript usage with React | — |
| `store-patterns.md` | Single vs multiple stores, slices, selectors, best practices | `setup.md` |
| `persistence.md` | Persist middleware, Electron-specific storage adapters | `setup.md`, `store-patterns.md` |
| `devtools.md` | Redux DevTools integration, debugging in Electron | `setup.md` |
| `electron-integration.md` | IPC state sync, main/renderer patterns, preload scripts | `setup.md`, `store-patterns.md`, `persistence.md` |
