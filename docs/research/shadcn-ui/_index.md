---
title: "shadcn/ui Research Index"
source:
  - url: "https://ui.shadcn.com/llms.txt"
    title: "shadcn/ui LLMs.txt"
  - url: "https://ui.shadcn.com/docs"
    title: "shadcn/ui Documentation"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn, ui, react, components, tailwindcss, radix]
---

# shadcn/ui

## Overview

shadcn/ui is a collection of re-usable UI components built with Radix UI and Tailwind CSS. Unlike traditional component libraries distributed as npm packages, shadcn/ui uses an "open code" model — you copy the component source directly into your project, giving you full ownership and customization control. It provides a CLI for adding components, a theming system built on CSS variables, and 50+ accessible components.

> **Official docs:** [ui.shadcn.com/docs](https://ui.shadcn.com/docs) — these research files summarize key concepts and link back to official docs rather than duplicating maintained content.

## How It All Fits Together

### Reading Order

Start with **overview-and-philosophy** to understand what shadcn/ui is and why it works differently from traditional component libraries (open code vs. npm dependency). This establishes the mental model for everything else.

Next, read **setup-and-configuration** for the practical setup: the CLI (`npx shadcn`), the `components.json` config file, and installation steps (Vite-focused, with links to other frameworks). This is where you go from "I understand it" to "I can use it."

From there, the topics branch:

- **theming-and-styling** covers the CSS variable system, color tokens (OKLCH format in Tailwind v4), dark mode implementation (with Vite-specific details), and theme customization. Read this before building any UI to understand how colors and design tokens work.

- **components-catalog** is a quick-reference of all 50+ components organized by category (Form, Layout, Overlay, Feedback, Display). Each entry links to official docs — use this as a lookup table, not a tutorial.

- **forms-and-validation** goes deeper into the form system: the `Form` and `Field` components, React Hook Form integration, TanStack Form integration, and Zod validation patterns. Read this when building forms.

- **advanced-topics** covers monorepo setup (**especially relevant** for this Nx project), React 19 compatibility, and the registry system for creating/sharing custom component collections. The Nx-specific section shows how to set up a shared `libs/ui` library with proper path aliases and `components.json` configuration.

- **mcp-server** is a deep-dive into the shadcn MCP server that lets AI assistants (Claude Code, Cursor, VS Code) browse, search, and install components via natural language. Includes setup instructions and configuration.

### Key Dependencies

- The **theming system** (CSS variables, OKLCH colors) underpins every component — changes there affect the entire UI
- **Radix UI** provides the accessibility layer (focus management, ARIA, keyboard nav) — shadcn/ui adds styling on top
- The **registry system** powers both the CLI (`npx shadcn add`) and the MCP server — understanding it explains how components are distributed
- In a **monorepo**, `components.json` aliases and TypeScript path mappings must align — the advanced topics doc covers this for Nx

## Key Concepts

- **Open Code Model** — Components are copied into your project, not installed as dependencies. You own the source.
- **Radix UI Primitives** — Accessible, unstyled primitives (Dialog, Popover, Select, etc.) used as the foundation layer.
- **Tailwind CSS v4** — Styling via utility classes and CSS variables in OKLCH color format.
- **CLI (`npx shadcn`)** — Tool for initializing projects (`init`) and adding components (`add`). Uses the registry to fetch source code.
- **`components.json`** — Configuration file controlling paths, aliases, styling options, and registry URLs.
- **Registry** — A code distribution platform (not npm). Anyone can create and share component registries.
- **MCP Server** — Model Context Protocol server that bridges AI assistants with the component registry for natural-language installation.

## File Index

| File | Description | Depends On |
|------|-------------|------------|
| [overview-and-philosophy.md](./overview-and-philosophy.md) | Core principles, open code model, technology stack, when to use | — |
| [setup-and-configuration.md](./setup-and-configuration.md) | CLI commands, `components.json` reference, Vite installation, framework links | overview-and-philosophy |
| [theming-and-styling.md](./theming-and-styling.md) | CSS variables, color system, dark mode (Vite), Tailwind v4 migration | setup-and-configuration |
| [components-catalog.md](./components-catalog.md) | Organized reference of all 50+ components with official doc links | setup-and-configuration |
| [forms-and-validation.md](./forms-and-validation.md) | Form/Field components, React Hook Form, TanStack Form, Zod validation | components-catalog |
| [advanced-topics.md](./advanced-topics.md) | Nx monorepo setup, React 19 compat, registry system | setup-and-configuration |
| [mcp-server.md](./mcp-server.md) | MCP server setup for Claude Code, Cursor, VS Code; registry integration | setup-and-configuration |
