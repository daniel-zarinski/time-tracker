---
title: "Tailwind CSS v4 — Research Index"
source:
  - url: "https://tailwindcss.com/docs"
    title: "Tailwind CSS v4 Documentation"
  - url: "https://github.com/tailwindlabs/tailwindcss"
    title: "Tailwind CSS GitHub Repository"
  - url: "https://tailwindcss.com/blog/tailwindcss-v4"
    title: "Tailwind CSS v4.0 Release Announcement"
created: 2026-02-21
updated: 2026-02-21
status: reviewed
tags: [tailwindcss, v4, css, utility-first, research-index]
---

# Tailwind CSS v4 — Research Index

## Overview

Tailwind CSS v4 is a ground-up rewrite of the utility-first CSS framework, released January 2025. It introduces a new high-performance engine (with Rust internals), CSS-first configuration via the `@theme` directive, zero-config content detection, and leverages modern CSS features like cascade layers, `@property`, and `color-mix()`. Performance improvements are dramatic — up to 182x faster incremental rebuilds.

This research covers installation, core concepts, theming, what's new in v4, layout patterns, typography/visuals, animations/transforms, and advanced features.

## How It All Fits Together

### Recommended Reading Order

1. **Start with [setup.md](setup.md)** — Choose your installation method (Vite plugin recommended), configure your editor with IntelliSense, and understand browser compatibility requirements. Everything else depends on having a working Tailwind setup.

2. **Read [core-concepts.md](core-concepts.md) next** — This is the foundation. Understand the utility-first philosophy, how state variants (`hover:`, `focus:`, `group-*`) work, the mobile-first responsive breakpoint system, dark mode strategies, and critically, how Tailwind's content detection scans your source files (and why class names must be static strings). Every other topic builds on these concepts.

3. **Then [theme-and-customization.md](theme-and-customization.md)** — Learn the `@theme` directive that replaces `tailwind.config.js`, the namespace conventions (`--color-*`, `--font-*`, `--spacing-*`), the OKLCH color system, and how to define custom utilities with `@utility` and custom variants with `@custom-variant`. This is essential before diving into specific utility categories, since it explains how to extend or override any default.

4. **Branch out to utility references** in any order based on your needs:
   - **[layout-and-spacing.md](layout-and-spacing.md)** — Flexbox, Grid, container queries (new in v4, no plugin needed!), the calc-based spacing system, and positioning patterns. Start here for building page structure.
   - **[typography-and-visuals.md](typography-and-visuals.md)** — Font utilities, the OKLCH color palette, gradients (linear with angles, radial, conic — all new/enhanced in v4), borders, shadows (`text-shadow` and `inset-shadow-*` are new), filters, and masks.
   - **[animations-and-transforms.md](animations-and-transforms.md)** — Transitions, `transition-behavior: allow-discrete` (new), built-in and custom keyframe animations, 2D and 3D transforms (`rotate-x-*`, `perspective-*` are new), and the `starting` variant for CSS `@starting-style` enter/exit animations.

5. **Read [advanced-features.md](advanced-features.md)** after you're comfortable with the basics — covers the new v4 variants (`not-*`, `inert`, `nth-*`, `in-*`, `**` descendant), the full directives reference (`@utility`, `@custom-variant`, `@variant`, `@source`, `@reference`, `@plugin`), arbitrary values/properties, and production optimization strategies.

6. **[whats-new-v4.md](whats-new-v4.md)** serves as both a reference and migration guide. If you're coming from v3, read this early (after setup) to understand all breaking changes, renamed utilities (e.g., `shadow-sm` -> `shadow-xs`, `bg-gradient-to-*` -> `bg-linear-to-*`, `!` modifier moved to end), and the automated `npx @tailwindcss/upgrade` tool. If you're new to Tailwind, this file is useful as a changelog reference.

### Architecture at a Glance

Tailwind v4's architecture centers on three pillars:

- **CSS-first configuration** — The `@theme` directive in your CSS file replaces `tailwind.config.js`. Design tokens defined in `@theme` become both utility classes AND native CSS custom properties accessible anywhere (CSS, JS, animation libraries).
- **Automatic content detection** — Tailwind scans your project files as plain text to find utility class names, respecting `.gitignore`. The `@source` directive gives you explicit control when needed.
- **Extension via CSS directives** — `@utility` creates custom utilities with full variant support, `@custom-variant` creates reusable variant patterns, and `@plugin` loads JavaScript plugins. No build tool configuration needed.

### Key Dependencies Between Topics

- **Theme** underpins everything — colors, spacing, fonts, breakpoints, and shadows all flow from `@theme` variables
- **Container queries** (in layout) use the `--container-*` theme namespace
- **Custom animations** (in animations) are registered via `@theme` with `--animate-*` keys
- **Custom easing functions** (in animations) use `@theme` with `--ease-*` keys
- **Advanced features** extends the patterns introduced in core-concepts and theme-and-customization

## Key Concepts

- **Utility-first CSS** — Style elements by composing small, single-purpose utility classes directly in markup instead of writing custom CSS
- **CSS-first configuration** — Configure your design system in CSS using `@theme {}` instead of JavaScript config files; all tokens become CSS custom properties
- **Theme variable namespaces** — Structured naming (`--color-*`, `--font-*`, `--spacing-*`, `--breakpoint-*`) that maps to utility class generation
- **OKLCH color space** — All default colors use perceptually uniform OKLCH, enabling wide-gamut P3 colors and consistent brightness
- **Variant composition** — State (`hover:`), responsive (`md:`), dark mode (`dark:`), and custom variants stack left-to-right
- **Zero-config content detection** — Tailwind automatically finds your template files, respecting `.gitignore`; `@source` directive for explicit control
- **Cascade layers** — v4 uses native `@layer` (base, components, utilities) for predictable style precedence
- **Vite-first tooling** — First-party `@tailwindcss/vite` plugin for optimal DX; also available as PostCSS plugin or standalone CLI
- **Lightning CSS integration** — Built-in CSS imports, nesting, and processing without external PostCSS plugins
- **`@utility` / `@custom-variant`** — CSS-only extension points for custom utilities and variants with full variant support

## File Index

| File | Description | Depends On |
|------|-------------|------------|
| [setup.md](setup.md) | Installation methods, editor setup, framework guides | — |
| [core-concepts.md](core-concepts.md) | Utility classes, states/variants, responsive design, dark mode | setup |
| [theme-and-customization.md](theme-and-customization.md) | CSS-first config, @theme, colors, custom styles, directives | setup, core-concepts |
| [whats-new-v4.md](whats-new-v4.md) | v4 changes, performance, migration from v3, upgrade guide | setup |
| [layout-and-spacing.md](layout-and-spacing.md) | Flexbox, Grid, container queries, spacing, sizing | core-concepts |
| [typography-and-visuals.md](typography-and-visuals.md) | Fonts, text, backgrounds, borders, effects, gradients | core-concepts, theme-and-customization |
| [animations-and-transforms.md](animations-and-transforms.md) | Transitions, animations, 3D transforms, @starting-style | core-concepts |
| [advanced-features.md](advanced-features.md) | New variants, plugins, directives, production optimization | core-concepts, theme-and-customization |
