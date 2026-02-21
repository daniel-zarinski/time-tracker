---
title: "Zustand and Electron IPC Integration"
source:
  - url: "https://www.electronjs.org/docs/latest/tutorial/process-model"
    title: "Process Model | Electron"
  - url: "https://www.electronjs.org/docs/latest/tutorial/ipc"
    title: "Inter-Process Communication | Electron"
  - url: "https://www.electronjs.org/docs/latest/api/context-bridge"
    title: "contextBridge | Electron"
  - url: "https://www.electronjs.org/docs/latest/tutorial/context-isolation"
    title: "Context Isolation | Electron"
  - url: "https://zustand.docs.pmnd.rs/apis/create-store"
    title: "createStore - Zustand"
  - url: "https://github.com/goosewobbler/zutron"
    title: "GitHub - goosewobbler/zutron: Streamlined Electron State Management"
  - url: "https://www.npmjs.com/package/@zubridge/electron"
    title: "@zubridge/electron - npm"
  - url: "https://www.bigbinary.com/blog/sync-store-main-renderer-electron"
    title: "Creating a synchronized store between main and renderer process in Electron"
  - url: "https://gist.github.com/anis-dr/5cba43157b87ecab19e59bd8fecca638"
    title: "Zustand middleware to sync state with Electron main process"
  - url: "https://brunoscheufler.com/blog/2023-10-29-syncing-state-between-electron-contexts"
    title: "Syncing State between Electron Contexts - Bruno Scheufler"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [zustand, electron, ipc, state-management, preload, contextBridge, multi-window]
---

# Zustand and Electron IPC Integration

## Overview

Electron's two-process model (main + renderer) means UI state and system-level state live in separate OS processes that can only communicate via IPC. Zustand bridges this gap cleanly: the renderer uses its normal hook API while a `store.subscribe()` listener forwards relevant changes to the main process — and main-process events push state back to the renderer via `webContents.send()`. This file covers patterns for wiring Zustand stores to Electron IPC in a secure, maintainable way.

## Electron Process Model Recap

```
┌───────────────────────────────────┐   IPC   ┌─────────────────────────────┐
│  Main Process (Node.js)           │◄───────►│  Renderer Process (Chromium) │
│  - Window lifecycle               │         │  - React UI                  │
│  - System tray / notifications    │         │  - Zustand hooks             │
│  - File I/O, native APIs          │         │  - No direct Node.js access  │
│  - ipcMain.handle / ipcMain.on    │         │  - ipcRenderer.invoke/on     │
└───────────────────────────────────┘         └─────────────────────────────┘
                ▲                                          ▲
                │                preload.ts                │
                └──────────────── contextBridge ───────────┘
```

Key constraints:
- The **renderer process** has no direct access to Node.js or Electron APIs when `contextIsolation: true` (default and recommended).
- All communication between processes passes through **IPC channels** — named strings with payload serialization (structured clone algorithm).
- A **preload script** runs in the renderer's context with access to both `ipcRenderer` and the DOM, and uses `contextBridge` to expose a safe API surface.

## Security: Preload + contextBridge

**Never expose the raw `ipcRenderer` object** to renderer code. Any XSS or malicious script could then send arbitrary IPC messages to the main process.

### ✅ Correct: expose only specific channel wrappers

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// Define the channels this app uses
const CHANNELS = {
  TIMER_START:   'timer:start',
  TIMER_STOP:    'timer:stop',
  TIMER_TICK:    'timer:tick',   // main → renderer push
  STATE_SYNC:    'state:sync',   // main → renderer full state
} as const

// Expose a typed, minimal API surface
contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer → Main (invoke = async request/response)
  startTimer: ()  => ipcRenderer.invoke(CHANNELS.TIMER_START),
  stopTimer:  ()  => ipcRenderer.invoke(CHANNELS.TIMER_STOP),

  // Main → Renderer (on = push notification)
  onTimerTick: (callback: (elapsed: number) => void) =>
    ipcRenderer.on(CHANNELS.TIMER_TICK, (_event, elapsed) => callback(elapsed)),

  onStateSync: (callback: (state: unknown) => void) =>
    ipcRenderer.on(CHANNELS.STATE_SYNC, (_event, state) => callback(state)),

  // Cleanup helpers to avoid listener leaks
  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
})
```

```typescript
// renderer global type declaration — renderer.d.ts
export interface ElectronAPI {
  startTimer: () => Promise<void>
  stopTimer:  () => Promise<void>
  onTimerTick: (callback: (elapsed: number) => void) => void
  onStateSync: (callback: (state: unknown) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

## Pattern 1 — Renderer-Owned Store, IPC for Side Effects

The simplest pattern: the **renderer owns all state** in a Zustand store. Actions that need main-process involvement (file writes, native dialogs, tray updates) call IPC as a side effect.

```typescript
// renderer — timerStore.ts
import { create } from 'zustand'

type TimerState = {
  elapsed: number
  isRunning: boolean
  startTimer: () => Promise<void>
  stopTimer:  () => Promise<void>
}

export const useTimerStore = create<TimerState>()((set) => ({
  elapsed: 0,
  isRunning: false,

  startTimer: async () => {
    await window.electronAPI.startTimer()   // notify main (tray update, etc.)
    set({ isRunning: true })
  },

  stopTimer: async () => {
    await window.electronAPI.stopTimer()
    set({ isRunning: false })
  },
}))
```

**When to use:** The timer logic runs in the renderer. Good for simple apps where the main process only needs occasional notifications.

**Limitation:** If the app is minimized or the renderer is unloaded, the timer stops. Not suitable for background timers.

## Pattern 2 — Main Process as Source of Truth (Recommended for Electron)

For timers, background tasks, or any state that must persist when windows are hidden: the **main process owns the canonical state**, and the renderer store is a synchronized mirror.

### Main process — vanilla Zustand store + IPC handlers

```typescript
// desktop/src/timerStore.ts (main process)
import { createStore } from 'zustand/vanilla'

type TimerState = {
  elapsed: number
  isRunning: boolean
}

export const timerStore = createStore<TimerState>()(() => ({
  elapsed: 0,
  isRunning: false,
}))

// Tick every second when running
let interval: NodeJS.Timeout | null = null

export function startMainTimer() {
  timerStore.setState({ isRunning: true })
  interval = setInterval(() => {
    timerStore.setState((s) => ({ elapsed: s.elapsed + 1 }))
  }, 1000)
}

export function stopMainTimer() {
  timerStore.setState({ isRunning: false })
  if (interval) { clearInterval(interval); interval = null }
}
```

```typescript
// desktop/src/main.ts — register IPC handlers
import { ipcMain, BrowserWindow } from 'electron'
import { timerStore, startMainTimer, stopMainTimer } from './timerStore'

export function registerTimerHandlers(win: BrowserWindow) {
  ipcMain.handle('timer:start', () => startMainTimer())
  ipcMain.handle('timer:stop',  () => stopMainTimer())

  // Push state to renderer on every change
  const unsubscribe = timerStore.subscribe((state) => {
    if (!win.isDestroyed()) {
      win.webContents.send('state:sync', state)
    }
  })

  win.on('closed', unsubscribe)
}
```

### Renderer — mirror store that hydrates from IPC pushes

```typescript
// renderer — timerStore.ts
import { create } from 'zustand'

type TimerMirror = {
  elapsed: number
  isRunning: boolean
  // Actions go through IPC — not stored locally
  start: () => Promise<void>
  stop:  () => Promise<void>
}

export const useTimerStore = create<TimerMirror>()((set) => {
  // Hydrate from main-process pushes
  window.electronAPI.onStateSync((state) => {
    set(state as Partial<TimerMirror>)
  })

  return {
    elapsed: 0,
    isRunning: false,
    start: () => window.electronAPI.startTimer(),
    stop:  () => window.electronAPI.stopTimer(),
  }
})
```

```tsx
// Component — reads local mirror, no IPC knowledge
function TimerDisplay() {
  const elapsed    = useTimerStore((s) => s.elapsed)
  const isRunning  = useTimerStore((s) => s.isRunning)
  const start      = useTimerStore((s) => s.start)
  const stop       = useTimerStore((s) => s.stop)

  return (
    <div>
      <span>{elapsed}s</span>
      <button onClick={isRunning ? stop : start}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
```

## Pattern 3 — Using `store.subscribe()` for Selective IPC

Rather than broadcasting full state on every change, subscribe to specific slices and only send the relevant fields:

```typescript
// desktop/src/main.ts
import { timerStore } from './timerStore'

// Only send elapsed, throttled to avoid IPC flooding
let lastElapsed = -1
timerStore.subscribe((state) => {
  if (state.elapsed !== lastElapsed) {
    lastElapsed = state.elapsed
    win.webContents.send('timer:tick', state.elapsed)
  }
})
```

This is more bandwidth-efficient when the store is large but only a small field changes frequently.

## Multi-Window State Sync

When the app has multiple `BrowserWindow` instances (e.g., a main window and a mini-player), broadcast from the main store to all windows:

```typescript
// desktop/src/main.ts
import { BrowserWindow } from 'electron'
import { timerStore } from './timerStore'

timerStore.subscribe((state) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send('state:sync', state)
    }
  })
})
```

Each renderer window hydrates its own Zustand mirror store from these pushes. No peer-to-peer communication between renderer processes is needed — all routing flows through the main process.

## Third-Party Libraries

Two libraries automate the IPC bridge boilerplate:

### `@zubridge/electron`

```bash
npm install @zubridge/electron
```

- Main process acts as single source of truth
- Renderer processes get a Zustand-like interface backed by IPC
- Actions dispatched in renderer are forwarded to main and applied to the canonical store
- State changes broadcast to all connected renderers automatically

### `zutron`

```bash
npm install zutron
```

- Creates a Zustand store in each renderer that mirrors the main-process store
- Unidirectional sync: main → renderer
- Minimal configuration; works with existing Zustand stores

Both libraries suit apps with multiple windows. For single-window apps the manual patterns above are simpler and add no dependency.

## Architecture Recommendation for This Time Tracker

| State | Lives in | Why |
|-------|----------|-----|
| Timer (elapsed, running, startedAt) | **Main process** | Must tick when window is hidden; drives tray badge |
| Active project ID | Main process | Referenced by tray menu |
| Session log (completed sessions) | Main process | Persisted to disk via `electron-store` |
| UI state (sidebar open, current view) | **Renderer** | Pure display concern, no main-process relevance |
| Project list (for display) | Renderer mirror | Read from main store on hydration |
| Settings | Both (renderer mirrors main) | Main needs idle timeout; renderer needs theme |

**Recommended data flow:**

```
[Main Process]                        [Renderer Process]
timerStore (vanilla Zustand)   ──→   useTimerStore (mirror)
  ↑ ipcMain.handle                      ↓ window.electronAPI.start/stop
  └── ipcRenderer.invoke ───────────────┘
```

## Cleanup and Memory Leaks

Always unsubscribe from both Zustand stores and IPC listeners when windows close:

```typescript
// In main.ts — clean up when window closes
const unsubscribeStore = timerStore.subscribe(broadcastToAllWindows)
win.on('closed', () => {
  unsubscribeStore()
  ipcMain.removeHandler('timer:start')
  ipcMain.removeHandler('timer:stop')
})
```

```typescript
// In renderer — remove IPC listeners when component unmounts
useEffect(() => {
  window.electronAPI.onStateSync(handleSync)
  return () => window.electronAPI.removeAllListeners('state:sync')
}, [])
```

## Summary

| Concern | Approach |
|---------|---------|
| Expose IPC to renderer | `contextBridge.exposeInMainWorld()` with specific wrappers |
| Never expose | Raw `ipcRenderer` object |
| Renderer → Main (request) | `ipcRenderer.invoke()` / `ipcMain.handle()` |
| Main → Renderer (push) | `win.webContents.send()` / `ipcRenderer.on()` |
| Multi-window broadcast | `BrowserWindow.getAllWindows().forEach(win => win.webContents.send(...))` |
| Main-process store | `createStore` from `zustand/vanilla` — no React needed |
| Renderer mirror store | Hydrate from `onStateSync` IPC push inside `create()` setup |
| Automated bridge | `@zubridge/electron` or `zutron` for complex multi-window apps |
