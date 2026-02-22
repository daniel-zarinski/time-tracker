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

### Database (Prisma + SQLite)

Copy `.env.example` to `.env` at the project root. The `DATABASE_URL` is used by Prisma CLI commands.

```bash
nx run database:migrate-dev    # Create & apply a new migration
nx run database:migrate-deploy # Apply pending migrations (production)
nx run database:push           # Push schema changes without a migration file
nx run database:generate       # Regenerate Prisma client (runs automatically on build)
nx run database:studio         # Open Prisma Studio GUI
```

Schema lives at `libs/database/prisma/schema.prisma`. After editing models, run `prisma-migrate-dev` to generate a migration.

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
