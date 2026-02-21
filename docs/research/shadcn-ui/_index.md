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

## How It All Fits Together

<!-- TO BE FILLED after all workers complete -->

## Key Concepts

- **Open Code Model** — Components are copied into your project, not installed as dependencies
- **Radix UI Primitives** — Accessible, unstyled primitives used as the foundation
- **Tailwind CSS v4** — Styling via utility classes and CSS variables
- **CLI (`npx shadcn`)** — Tool for initializing projects and adding components
- **`components.json`** — Configuration file controlling paths, aliases, and styling options
- **Registry** — System for distributing and sharing component collections

## File Index

| File | Description | Depends On |
|------|-------------|------------|
| [overview-and-philosophy.md](./overview-and-philosophy.md) | Core principles, open code model, architecture | — |
| [setup-and-configuration.md](./setup-and-configuration.md) | CLI, components.json, installation guides | overview-and-philosophy |
| [theming-and-styling.md](./theming-and-styling.md) | Theming system, CSS variables, dark mode, Tailwind v4 | setup-and-configuration |
| [components-catalog.md](./components-catalog.md) | Organized reference of all 50+ components with links | setup-and-configuration |
| [forms-and-validation.md](./forms-and-validation.md) | Form system, Field component, React Hook Form, TanStack Form | components-catalog |
| [advanced-topics.md](./advanced-topics.md) | Monorepo setup, registry system, React 19, MCP server | setup-and-configuration |
