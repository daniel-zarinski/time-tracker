---
title: "Tailwind CSS v4 — Setup & Installation"
source:
  - url: "https://tailwindcss.com/docs/installation"
    title: "Tailwind CSS Installation"
  - url: "https://tailwindcss.com/docs/installation/tailwind-cli"
    title: "Install Tailwind CSS with the Tailwind CLI"
  - url: "https://tailwindcss.com/docs/installation/using-postcss"
    title: "Install Tailwind CSS with PostCSS"
  - url: "https://tailwindcss.com/docs/installation/play-cdn"
    title: "Try Tailwind CSS using the Play CDN"
  - url: "https://tailwindcss.com/docs/editor-setup"
    title: "Editor Setup — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/compatibility"
    title: "Compatibility — Tailwind CSS"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, installation, setup, vite, postcss, cli, cdn]
---

# Tailwind CSS v4 — Setup & Installation

## Overview

Tailwind CSS v4 works by scanning HTML files, JavaScript components, and templates for utility class names, then generating the corresponding CSS and writing it to a static output file. The key change from v3 is that v4 uses `@import "tailwindcss"` instead of the old `@tailwind` directives, and the PostCSS plugin now lives in a separate `@tailwindcss/postcss` package.

## Installation Methods

Tailwind CSS v4 supports four primary installation approaches:

1. **Vite plugin** (`@tailwindcss/vite`) — recommended for Vite-based projects
2. **PostCSS plugin** (`@tailwindcss/postcss`) — recommended for Next.js, Angular, and other PostCSS-based frameworks
3. **Tailwind CLI** (`@tailwindcss/cli`) — standalone approach with no bundler required
4. **Play CDN** — browser-only, for quick prototyping without a build step

## Vite Plugin (Recommended)

The `@tailwindcss/vite` plugin is the recommended approach for Vite-based projects and offers the best performance.

### Step 1 — Create your project

```bash
npm create vite@latest my-project
cd my-project
```

### Step 2 — Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

### Step 3 — Configure the Vite plugin

**`vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

### Step 4 — Import Tailwind CSS

Add the import to your main CSS file (e.g. `src/style.css`):

```css
@import "tailwindcss";
```

### Step 5 — Start the dev server

```bash
npm run dev
```

### Step 6 — Use Tailwind classes in HTML

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="/src/style.css" rel="stylesheet">
  </head>
  <body>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
  </body>
</html>
```

## PostCSS Plugin

The PostCSS plugin is the most seamless integration path for frameworks like Next.js and Angular. Note that in v4, the plugin has moved to a separate package (`@tailwindcss/postcss`).

### Step 1 — Install dependencies

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### Step 2 — Configure PostCSS

**`postcss.config.mjs`**
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
}
```

### Step 3 — Import Tailwind CSS

```css
@import "tailwindcss";
```

### Step 4 — Start your build process

```bash
npm run dev
```

## Tailwind CLI

The CLI approach is the simplest way to get started without a bundler. It's also available as a standalone executable that doesn't require Node.js.

### Step 1 — Install Tailwind CSS and CLI

```bash
npm install tailwindcss @tailwindcss/cli
```

### Step 2 — Create your input CSS

**`src/input.css`**
```css
@import "tailwindcss";
```

### Step 3 — Run the CLI build

```bash
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

| Flag | Description |
|------|-------------|
| `-i` | Input CSS file path |
| `-o` | Output CSS file path |
| `--watch` | Watch for changes and rebuild |

### Step 4 — Link the compiled CSS

**`src/index.html`**
```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="./output.css" rel="stylesheet">
  </head>
  <body>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
  </body>
</html>
```

## Play CDN

The Play CDN lets you try Tailwind directly in the browser with zero build tooling. It is intended for development and prototyping only — do not use it in production.

### Basic setup

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  </head>
  <body>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
  </body>
</html>
```

### Adding custom CSS via Play CDN

Use `type="text/tailwindcss"` in a `<style>` tag to add custom theme values or CSS:

```html
<head>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">
    @theme {
      --color-clifford: #da373d;
    }
  </style>
</head>
<body>
  <h1 class="text-3xl font-bold text-clifford">Hello world!</h1>
</body>
```

## Editor Setup

### VS Code — Tailwind CSS IntelliSense

Install the official [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension for VS Code.

Features:
- Autocomplete for utility classes, CSS functions, and directives
- Linting — highlights errors and potential bugs
- Hover previews — shows full CSS for any utility class
- Syntax highlighting for custom Tailwind at-rules (`@theme`, `@variant`, `@source`)

### Prettier — Class Sorting

Install the official [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) to automatically sort classes in the recommended order.

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

**`prettier.config.js`**
```javascript
export default {
  plugins: ['prettier-plugin-tailwindcss'],
}
```

**Example sort result:**

Before:
```html
<button class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">Submit</button>
```

After:
```html
<button class="bg-sky-700 px-4 py-2 text-white hover:bg-sky-800 sm:px-8 sm:py-3">Submit</button>
```

### Other Editors

| Editor | Support |
|--------|---------|
| **Cursor** | Supports VS Code extensions including Tailwind IntelliSense |
| **Zed** | Built-in autocompletion, linting, and hover previews — no extension needed |
| **JetBrains IDEs** | Built-in Tailwind CSS completions in WebStorm, PhpStorm, etc. |

## Compatibility

### Browser Requirements

Tailwind CSS v4 targets modern browsers:

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 111 (March 2023) |
| Safari  | 16.4 (March 2023) |
| Firefox | 128 (July 2024) |

Some utilities use bleeding-edge CSS features with limited browser support (`field-sizing: content`, `@starting-style`, `text-wrap: balance`). These are opt-in — avoid them if your target browsers don't support them.

### CSS Preprocessors

Tailwind CSS v4 is **not compatible** with Sass, Less, or Stylus. Tailwind itself acts as the preprocessor via Lightning CSS, providing:

- Build-time CSS imports (`@import`)
- Native CSS variables
- CSS nesting

### Scoped Component Styles (Vue, Svelte, Astro)

Avoid using `<style>` blocks alongside Tailwind. Prefer utility classes directly in markup. If you must use scoped styles, reference your global stylesheet:

```vue
<style scoped>
  @reference "../app.css";
  button {
    @apply bg-blue-500;
  }
</style>
```

Or use CSS variables directly:

```vue
<style scoped>
  button {
    background-color: var(--color-blue-500);
  }
</style>
```

### CSS Modules

CSS Modules work with Tailwind but are not recommended — utility-first CSS makes scoping unnecessary and adds performance overhead.

## Key Differences from v3

| Feature | v3 | v4 |
|---------|----|----|
| CSS import | `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| PostCSS plugin package | `tailwindcss` (built-in) | `@tailwindcss/postcss` (separate package) |
| Vite plugin | Not available | `@tailwindcss/vite` |
| CLI package | `tailwindcss` (via `npx tailwindcss`) | `@tailwindcss/cli` (via `npx @tailwindcss/cli`) |
| Configuration | `tailwind.config.js` | CSS-first via `@theme` in CSS |
