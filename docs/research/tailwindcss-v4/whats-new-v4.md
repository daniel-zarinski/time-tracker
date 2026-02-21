---
title: "Tailwind CSS v4 — What's New & Migration Guide"
source:
  - url: "https://tailwindcss.com/blog/tailwindcss-v4"
    title: "Tailwind CSS v4.0"
  - url: "https://tailwindcss.com/docs/upgrade-guide"
    title: "Upgrade Guide"
  - url: "https://tailwindcss.com/docs/compatibility"
    title: "Compatibility"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, migration, upgrade, whats-new, breaking-changes]
---

# Tailwind CSS v4 — What's New & Migration Guide

## Overview

Tailwind CSS v4 is a ground-up rewrite of the framework, delivering dramatic performance improvements through a new Rust-based engine and Lightning CSS integration. It introduces a CSS-first configuration model (replacing `tailwind.config.js` with `@theme` in CSS), adds powerful new features like built-in container queries and 3D transforms, and modernizes the framework to leverage native CSS capabilities like cascade layers, `@property`, and `color-mix()`.

## Performance Improvements

Build performance improvements are the headline feature of v4, measured against v3.4:

| Build Type | v3.4 | v4.0 | Improvement |
|------------|------|------|-------------|
| Full build | 378ms | 100ms | **3.78x faster** |
| Incremental (new CSS) | 44ms | 5ms | **8.8x faster** |
| Incremental (no new CSS) | 35ms | 192µs | **182x faster** |

The 182x speedup for incremental builds with no new CSS (completing in **microseconds**) is the most impactful change for day-to-day development, as most saves don't produce new CSS.

## Architecture Changes

### New Engine

v4 is a complete rewrite optimized for performance and leveraging modern web platform capabilities. The new engine has a significantly simpler internal architecture, reducing the surface area for bugs.

### Lightning CSS Integration

Tailwind v4 uses [Lightning CSS](https://lightningcss.dev/) internally, which:

- Handles CSS imports natively (no more `postcss-import` plugin)
- Processes nested CSS automatically
- Flattens nested selectors for output:

```css
/* Input */
.typography {
  p { font-size: var(--text-base); }
  img { border-radius: var(--radius-lg); }
}

/* Output */
.typography p { font-size: var(--text-base); }
.typography img { border-radius: var(--radius-lg); }
```

### Simplified Installation

```bash
# Install
npm install -D tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts (recommended)
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

```css
/* app.css — just one line */
@import "tailwindcss";
```

- No more `@tailwind base/components/utilities` directives
- No more manual `content` configuration
- No more `postcss-import` or `autoprefixer` needed

## CSS-First Configuration

The `tailwind.config.js` file is replaced by `@theme` blocks in CSS. All design tokens become CSS custom properties available at runtime.

### Before (v3)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#316ff6",
      },
      fontFamily: {
        display: ["Satoshi", "sans-serif"],
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
};
```

### After (v4)

```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-brand: #316ff6;
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;

  /* Colors in OKLCH for wide-gamut displays */
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-500: oklch(0.84 0.18 117.33);

  /* Custom easing functions */
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

If you need to keep `tailwind.config.js`, explicitly load it:

```css
@config "../../tailwind.config.js";
```

## Modern CSS Features

### Cascade Layers

v4 uses native CSS `@layer` for better style rule interaction and specificity control.

### Registered Custom Properties (`@property`)

Theme variables use `@property` declarations, which:
- Enable gradient animations (previously impossible with CSS variables)
- Improve performance on large pages

### `color-mix()` Integration

Any color value can have its opacity adjusted using `color-mix()`, including CSS variables and `currentColor`:

```html
<div class="bg-brand/50">50% opacity brand color</div>
<div class="text-current/75">75% opacity currentColor</div>
```

### Wide-Gamut Color Palette (OKLCH)

The entire default color palette was upgraded from `rgb` to `oklch`:
- Richer, more vivid colors on modern displays (P3 gamut)
- Perceptually uniform color adjustments
- Maintains v3's color balance to minimize migration impact

### Logical Properties

Internal use of CSS logical properties (e.g., `margin-inline-start` instead of `margin-left`) simplifies RTL support and reduces generated CSS size.

## New Features

### Container Queries (Built-In)

Previously required a separate plugin. Now included by default:

```html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-4">
    <!-- Responds to parent container width, not viewport -->
  </div>
</div>
```

Max-width containers and ranges:

```html
<!-- Only below @md container size -->
<div class="grid grid-cols-3 @max-md:grid-cols-1"></div>

<!-- Between @min-md and @max-xl -->
<div class="flex @min-md:@max-xl:hidden"></div>
```

### 3D Transform Utilities

Full 3D transform support:

```html
<div class="perspective-distant">
  <article class="rotate-x-51 rotate-z-43 transform-3d ...">
    3D transformed content
  </article>
</div>
```

New utilities: `rotate-x-*`, `rotate-y-*`, `rotate-z-*`, `scale-z-*`, `translate-z-*`, `perspective-*`, `transform-3d`

### Expanded Gradient APIs

**Linear gradient with angle:**

```html
<div class="bg-linear-45 from-indigo-500 via-purple-500 to-pink-500"></div>
```

**Interpolation color space modifiers:**

```html
<!-- sRGB (default, matches v3) -->
<div class="bg-linear-to-r/srgb from-indigo-500 to-teal-400"></div>

<!-- OKLCH (more vivid, perceptually uniform) -->
<div class="bg-linear-to-r/oklch from-indigo-500 to-teal-400"></div>
```

**Conic and radial gradients:**

```html
<div class="bg-conic/[in_hsl_longer_hue] from-red-600 to-red-600"></div>
<div class="bg-radial-[at_25%_25%] from-white to-zinc-900 to-75%"></div>
```

### `@starting-style` Support

Create enter/exit transitions without JavaScript using the `starting:` variant:

```html
<button popoverTarget="my-popover">Check for updates</button>
<div
  popover
  id="my-popover"
  class="opacity-100 transition-discrete starting:open:opacity-0 open:opacity-100"
>
  Popover content that fades in
</div>
```

### `not-*` Variant

Style elements when they do NOT match a condition:

```html
<div class="not-hover:opacity-75">Fades when not hovered</div>
<div class="not-supports-hanging-punctuation:px-4">Padding when not supported</div>
```

Also works with media queries:

```html
<div class="not-dark:text-gray-900">Only in light mode</div>
```

### Inset Shadows and Rings

Stack multiple shadow layers (up to 4):

```html
<div class="inset-shadow-sm inset-ring-2 inset-ring-black/20">
  Layered inset effects
</div>
```

### Additional New Utilities

| Utility | Purpose |
|---------|---------|
| `field-sizing-content` | Auto-resize textareas without JavaScript |
| `color-scheme-dark` | Fix scrollbar colors in dark mode |
| `font-stretch-*` | Adjust variable font width axis |
| `inert` variant | Style non-interactive (inert) elements |
| `nth-*` variants | Complex positional selection |
| `in-*` variant | Like `group-*` but without needing `group` class |
| `open:` variant | Style `<details>` and `<dialog>` when open |

### Dynamic Utility Values

v4 generates utilities dynamically from CSS variables — any multiple of the base spacing unit works:

```html
<!-- All valid — no config needed -->
<div class="grid grid-cols-15">15 columns</div>
<div class="mt-17">margin-top: calc(0.25rem * 17)</div>
<div class="w-29">width: calc(0.25rem * 29)</div>
```

Custom data attributes work without configuration:

```html
<div data-current class="opacity-75 data-current:opacity-100">Active</div>
```

---

## Breaking Changes

### Renamed Utilities

| v3 | v4 | Notes |
|----|----|-------|
| `shadow-sm` | `shadow-xs` | Scale shift |
| `shadow` | `shadow-sm` | Scale shift |
| `drop-shadow-sm` | `drop-shadow-xs` | Scale shift |
| `blur-sm` | `blur-xs` | Scale shift |
| `rounded-sm` | `rounded-xs` | Scale shift |
| `outline-none` | `outline-hidden` | More semantic name |
| `ring` | `ring-3` | Default width: 3px → 1px |
| `bg-gradient-to-*` | `bg-linear-to-*` | Gradient rename |

### Removed Deprecated Utilities

| Removed | Replacement |
|---------|-------------|
| `bg-opacity-*` | `bg-black/50` (opacity modifier) |
| `text-opacity-*` | `text-black/50` |
| `border-opacity-*` | `border-black/50` |
| `ring-opacity-*` | `ring-black/50` |
| `flex-shrink-*` | `shrink-*` |
| `flex-grow-*` | `grow-*` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-slice` | `box-decoration-slice` |
| `decoration-clone` | `box-decoration-clone` |

### Default Color Changes

Border and ring utilities no longer have default colors:

```html
<!-- v3: border-gray-200 by default -->
<!-- v4: currentColor by default — must specify color -->
<div class="border border-gray-200 px-2 py-3">Explicit color required</div>

<!-- v3: ring-blue-500 + 3px by default -->
<!-- v4: currentColor + 1px by default -->
<button class="focus:ring-3 focus:ring-blue-500">Explicit color + width</button>
```

### `!` Modifier Position

```html
<!-- v3: ! at the beginning -->
<div class="!flex !bg-red-500">

<!-- v4: ! at the end -->
<div class="flex! bg-red-500!">
```

### Arbitrary Variable Syntax

```html
<!-- v3 -->
<div class="bg-[--brand-color]">

<!-- v4: use parentheses -->
<div class="bg-(--brand-color)">
```

### Variant Stacking Order

```html
<!-- v3: right to left -->
<ul class="first:*:pt-0 last:*:pb-0">

<!-- v4: left to right -->
<ul class="*:first:pt-0 *:last:pb-0">
```

### Arbitrary Grid/Object Values

```html
<!-- v3: commas allowed -->
<div class="grid-cols-[max-content,auto]">

<!-- v4: use underscores -->
<div class="grid-cols-[max-content_auto]">
```

### Transform Reset

```html
<!-- v3 -->
<button class="scale-150 focus:transform-none">

<!-- v4: reset individual properties -->
<button class="scale-150 focus:scale-none">
```

### Space/Divide Selector Change

The selector used for space and divide utilities changed for performance:

```css
/* v3: :not([hidden]) ~ :not([hidden]) */
/* v4: :not(:last-child) with margin on opposite side */
```

This is a behavior change — validate layout if you use `space-*` or `divide-*`.

### Custom Utilities Syntax

```css
/* v3 */
@layer utilities {
  .tab-4 { tab-size: 4; }
}

/* v4 */
@utility tab-4 {
  tab-size: 4;
}
```

### Preflight Changes

| v3 Default | v4 Default | Fix |
|------------|------------|-----|
| Placeholder: `gray-400` | Placeholder: `currentColor/50` | Add `@layer base` override |
| Button: `cursor-pointer` | Button: `cursor-default` | Add `@layer base` override |
| Dialog: centered | Dialog: margins reset | Add `dialog { margin: auto }` |

### Removed Features

- **CSS Preprocessors** — Sass, Less, Stylus not supported
- **`corePlugins` option** — Removed
- **Auto JS config detection** — Must use `@config` directive
- **`resolveConfig()` function** — Use `getComputedStyle()` and CSS variables instead

Accessing theme values in JavaScript (v4):

```javascript
// v3: resolveConfig() - REMOVED in v4
// v4: use CSS custom properties
const styles = getComputedStyle(document.documentElement);
const shadowValue = styles.getPropertyValue("--shadow-xl");

// With animation libraries
// <motion.div animate={{ backgroundColor: "var(--color-blue-500)" }} />
```

---

## Migration Guide

### Automated Upgrade (Recommended)

```bash
npx @tailwindcss/upgrade
```

Requirements: Node.js 20+. Run on a new branch and review the diff before merging.

### Manual Migration Checklist

- [ ] Update packages: replace `tailwindcss` + `postcss-import` + `autoprefixer` with `@tailwindcss/vite` or `@tailwindcss/postcss`
- [ ] Update CSS: replace `@tailwind base/components/utilities` with `@import "tailwindcss"`
- [ ] Migrate `tailwind.config.js` to `@theme {}` in CSS
- [ ] Update renamed utilities (shadow, blur, rounded, ring, outline scale)
- [ ] Add explicit colors to `border`, `divide`, and `ring` utilities
- [ ] Move `!` modifier to end of class names
- [ ] Update arbitrary variable syntax: `[--var]` → `(--var)`
- [ ] Fix variant stacking order (now left-to-right)
- [ ] Replace commas with underscores in grid/object-position arbitrary values
- [ ] Update `transform-none` resets to individual property resets
- [ ] Replace `@layer utilities { }` with `@utility` directive
- [ ] Update Preflight-dependent styles (placeholder, cursor, dialog)
- [ ] Replace `resolveConfig()` usage with CSS variable access

### Using `@apply` in Component Styles

For Vue, Svelte, or CSS modules with scoped styles, import the theme as a reference:

```vue
<style scoped>
  @reference "../../app.css";

  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>
```

Or use CSS variables directly (preferred):

```vue
<style scoped>
  h1 {
    color: var(--color-red-500);
    font-size: var(--text-2xl);
  }
</style>
```

---

## Compatibility Requirements

### Browser Support

v4 requires modern browsers that support `@property` and `color-mix()`:

| Browser | Minimum Version | Released |
|---------|----------------|----------|
| Chrome | 111 | March 2023 |
| Safari | 16.4 | March 2023 |
| Firefox | 128 | July 2024 |

If you need broader browser support, stay on Tailwind v3.4.

Some v4 utilities have even narrower support (e.g., `field-sizing`, `@starting-style`, `text-wrap: balance`). These are safe to use — unsupported browsers simply ignore them.

### Node.js

The automated upgrade tool requires **Node.js 20+**.

### CSS Preprocessors

Tailwind v4 is **not compatible** with Sass, Less, or Stylus. Use Tailwind's built-in capabilities instead:
- CSS imports handled automatically (via Lightning CSS)
- Nesting supported natively
- CSS variables replace preprocessor variables
- `@layer` and `@utility` replace preprocessor mixins
