# Time Tracker

An Electron desktop time-tracking application built with Nx, React, and Tailwind CSS.


## Useful Commands

```bash
tmux -CC
claude --teammate-mode tmux --agent research-leader
```

## Quick Start

```bash
npm install
```

### Development

Run both commands in separate terminals:

```bash
nx serve renderer   # React dev server on localhost:4200
nx serve desktop    # Electron window loading the renderer
```

### Build

```bash
nx build renderer
nx build desktop
```

### Test

```bash
nx test renderer
```

### Package / Distribute

```bash
nx run desktop:package   # Package without installer
nx run desktop:make      # Create platform installer
```

## Project Structure

```
apps/
  renderer/    # React frontend (webpack, Tailwind CSS v4)
  desktop/     # Electron main process (nx-electron)
libs/          # Shared libraries
docs/research/ # Research documentation
```

## Tech Stack

- **Nx 22** — Integrated monorepo
- **React 19** — Frontend UI
- **Electron 34** — Desktop runtime
- **Tailwind CSS v4** — Styling
- **Webpack** — Bundler (required by nx-electron)
- **Jest** — Unit testing
