---
title: "Tailwind CSS v4 — Theme & Customization"
source:
  - url: "https://tailwindcss.com/docs/theme"
    title: "Theme Variables — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/colors"
    title: "Colors — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/adding-custom-styles"
    title: "Adding Custom Styles — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/functions-and-directives"
    title: "Functions & Directives — Tailwind CSS"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, theme, customization, design-tokens, colors, oklch]
---

# Tailwind CSS v4 — Theme & Customization

## Overview

Tailwind CSS v4 replaces the JavaScript-based `tailwind.config.js` with a CSS-first configuration model. All design tokens are defined using the `@theme` directive, which maps CSS custom properties to utility classes. This approach means your theme lives in the same CSS file as your other styles, with no separate config file required.

## CSS-First Configuration

In v3, customization lived in `tailwind.config.js`. In v4, it lives in CSS:

**v3 (JavaScript config)**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        midnight: '#121063',
      },
      fontFamily: {
        display: ['Satoshi', 'sans-serif'],
      },
    },
  },
}
```

**v4 (CSS config)**
```css
@import "tailwindcss";

@theme {
  --color-midnight: #121063;
  --font-display: "Satoshi", "sans-serif";
}
```

## The @theme Directive

The `@theme` directive defines design tokens that instruct Tailwind to generate utility classes. It differs from `:root` in that it is semantically tied to Tailwind's utility generation.

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
  --font-script: Great Vibes, cursive;
  --breakpoint-3xl: 120rem;
}
```

These tokens become available as utility classes (`bg-mint-500`, `font-script`) and as CSS variables throughout your stylesheets.

> **Rule:** `@theme` variables cannot be nested under selectors or media queries — they are always top-level design tokens. For regular CSS variables that shouldn't generate utilities, use `:root` instead.

## Theme Variable Namespaces

Each namespace maps to specific utility classes:

| Namespace | Utilities Generated | Example |
|-----------|--------------------|---------
| `--color-*` | Color utilities | `bg-red-500`, `text-sky-300` |
| `--font-*` | Font family | `font-sans`, `font-serif` |
| `--text-*` | Font size | `text-xl`, `text-base` |
| `--font-weight-*` | Font weight | `font-bold`, `font-semibold` |
| `--tracking-*` | Letter spacing | `tracking-wide` |
| `--leading-*` | Line height | `leading-tight` |
| `--spacing-*` | Spacing & sizing | `px-4`, `max-h-16` |
| `--breakpoint-*` | Responsive variants | `sm:*`, `md:*` |
| `--container-*` | Container queries | `@sm:*`, `max-w-md` |
| `--radius-*` | Border radius | `rounded-sm`, `rounded-lg` |
| `--shadow-*` | Box shadow | `shadow-md`, `shadow-lg` |
| `--blur-*` | Blur filters | `blur-md` |
| `--ease-*` | Timing functions | `ease-out` |
| `--animate-*` | Animations | `animate-spin` |

## Common Customization Patterns

### Extending the Default Theme

Add new values to an existing namespace:

```css
@import "tailwindcss";

@theme {
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}
```

### Overriding Default Values

Redefine an existing token to change its value:

```css
@import "tailwindcss";

@theme {
  --breakpoint-sm: 30rem;   /* default is 40rem */
}
```

### Replacing an Entire Namespace

Reset a namespace with `initial`, then add only the values you want:

```css
@import "tailwindcss";

@theme {
  --color-*: initial;         /* remove all default colors */
  --color-white: #fff;
  --color-purple: #3f3cbb;
  --color-midnight: #121063;
}
```

### Complete Custom Theme

Disable every default token:

```css
@import "tailwindcss";

@theme {
  --*: initial;               /* remove ALL defaults */
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
  --color-coral: oklch(0.74 0.17 40.24);
}
```

### Sharing a Theme Across Projects

```css
/* packages/brand/theme.css */
@theme {
  --*: initial;
  --color-lagoon: oklch(0.72 0.11 221.19);
  --font-body: Inter, sans-serif;
}
```

```css
/* apps/admin/app.css */
@import "tailwindcss";
@import "../../../packages/brand/theme.css";
```

### Referencing Other Variables

Use `@theme inline` when a token references a CSS variable so the utility class uses the resolved value:

```css
@import "tailwindcss";

:root {
  --brand-canvas: oklch(0.967 0.003 264.542);
}

[data-theme="dark"] {
  --brand-canvas: oklch(0.21 0.034 264.665);
}

@theme inline {
  --color-canvas: var(--brand-canvas);
}
```

## Color System

### OKLCH Color Format

All default colors use the OKLCH color space for perceptually uniform brightness:

```
oklch(L C H)
```

| Component | Range | Meaning |
|-----------|-------|---------|
| L (Lightness) | 0–100% | Perceived brightness |
| C (Chroma) | 0+ | Color intensity / saturation |
| H (Hue) | 0–360° | Position on color wheel |

```css
@theme {
  --color-blue-500:  oklch(62.3% 0.214 259.815);
  --color-sky-500:   oklch(68.5% 0.169 237.323);
  --color-red-500:   oklch(63.7% 0.237 25.331);
}
```

### Color Palette

The default palette includes 11 steps (50, 100, 200 … 900, 950) for each color family:

**Chromatic:** red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

**Neutral:** slate, gray, zinc, neutral, stone

### Opacity via color-mix()

Use the `/` modifier to control opacity:

```html
<div class="bg-sky-500/10"></div>
<div class="bg-sky-500/50"></div>
<div class="bg-sky-500/100"></div>

<!-- Arbitrary opacity -->
<div class="bg-pink-500/[71.37%]"></div>

<!-- CSS variable as opacity -->
<div class="bg-cyan-400/(--my-alpha)"></div>
```

In custom CSS, use the `--alpha()` function:

```css
.element {
  background-color: --alpha(var(--color-gray-950) / 10%);
}
```

### Custom Colors

```css
@import "tailwindcss";

@theme {
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```

Now `bg-midnight`, `text-tahiti`, and `fill-bermuda` are available.

## Adding Custom Styles

### Custom Base Styles

Use `@layer base` for bare element styles:

```css
@layer base {
  h1 { font-size: var(--text-2xl); }
  h2 { font-size: var(--text-xl); }
  a  { color: var(--color-blue-500); }
}
```

### Custom Component Classes

Use `@layer components` for reusable component patterns that can still be overridden by utilities:

```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-xl);
  }
}
```

```html
<div class="card rounded-none">...</div>  <!-- override is fine -->
```

### Custom Utilities with @utility

Define custom utilities that support all Tailwind variants (`hover:`, `lg:`, `dark:`, etc.):

```css
/* Simple utility */
@utility content-auto {
  content-visibility: auto;
}

/* Complex utility with pseudo-elements */
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

```html
<div class="content-auto hover:content-auto lg:scrollbar-hidden">...</div>
```

### Functional (Parameterized) Utilities

Use `--value()` to create utilities that accept values:

```css
/* Match theme tokens */
@theme {
  --tab-size-2: 2;
  --tab-size-4: 4;
  --tab-size-github: 8;
}

@utility tab-* {
  tab-size: --value(--tab-size-*);
}
```

Usage: `tab-2`, `tab-4`, `tab-github`

```css
/* Accept bare integers */
@utility tab-* {
  tab-size: --value(integer);
}
```

Usage: `tab-1`, `tab-76`

```css
/* Accept arbitrary values */
@utility tab-* {
  tab-size: --value([integer]);
}
```

Usage: `tab-[3]`

```css
/* Support all forms together */
@utility opacity-* {
  opacity: --value([percentage]);
  opacity: calc(--value(integer) * 1%);
  opacity: --value(--opacity-*);
}
```

### Arbitrary Values in Markup

Generate one-off utilities inline without writing custom CSS:

```html
<!-- Arbitrary numeric values -->
<div class="top-[117px] w-[450px]">...</div>

<!-- Arbitrary colors -->
<div class="bg-[#bada55] text-[#333]">...</div>

<!-- Arbitrary CSS properties -->
<div class="[mask-type:luminance]">...</div>
<div class="[grid-template-columns:1fr_auto_1fr]">...</div>

<!-- Using CSS variables -->
<div class="fill-(--my-brand-color)">...</div>
```

### Custom Variants with @custom-variant

```css
/* Shorthand form */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));

/* Full form with @slot for multiple rules */
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}
```

```html
<html data-theme="midnight">
  <button class="theme-midnight:bg-black theme-midnight:text-white">...</button>
</html>
```

## Functions & Directives Reference

### Directives

| Directive | Purpose |
|-----------|---------|
| `@import "tailwindcss"` | Load Tailwind CSS |
| `@theme { }` | Define design tokens |
| `@source "path"` | Explicitly add a source for class scanning |
| `@layer base/components` | Add styles to Tailwind's cascade layers |
| `@utility name { }` | Define a custom utility class |
| `@variant name { }` | Apply a variant to custom CSS |
| `@custom-variant name` | Define a new variant |
| `@apply` | Inline utility classes into custom CSS |
| `@reference "file"` | Import tokens/utilities without emitting CSS |
| `@config "file"` | Load a legacy v3 `tailwind.config.js` |
| `@plugin "package"` | Load a legacy v3 plugin |

### CSS Functions

**`--alpha(color / opacity)`** — Adjust color opacity using `color-mix()`:

```css
.element {
  /* input */
  color: --alpha(var(--color-lime-300) / 50%);
  /* compiled to */
  color: color-mix(in oklab, var(--color-lime-300) 50%, transparent);
}
```

**`--spacing(n)`** — Generate spacing relative to the base spacing unit:

```css
.element {
  /* input */
  margin: --spacing(4);
  /* compiled to */
  margin: calc(var(--spacing) * 4);
}
```

**`theme()` (deprecated)** — Legacy function to access theme values; prefer CSS variables instead:

```css
/* v3 style (still works but deprecated) */
.element { margin: theme(spacing.12); }

/* v4 preferred */
.element { margin: var(--spacing-12); }
```

### @apply

Inline utility classes into custom CSS (useful for CSS Modules or third-party integrations):

```css
.select2-dropdown {
  @apply rounded-b-lg shadow-md;
}
.select2-search {
  @apply rounded border border-gray-300;
}
```

### @variant in Custom CSS

Use existing variants inside custom CSS rules:

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

## Using Theme Variables in CSS and JS

### In Custom CSS

```css
@layer components {
  .typography {
    p {
      font-size: var(--text-base);
      color: var(--color-gray-700);
    }
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-semibold);
    }
  }
}
```

### In JavaScript

```javascript
const styles = getComputedStyle(document.documentElement);
const shadow = styles.getPropertyValue('--shadow-xl');
const blue500 = styles.getPropertyValue('--color-blue-500');
```

### With Animation Libraries

```jsx
// motion / framer-motion
<motion.div animate={{ backgroundColor: "var(--color-blue-500)" }} />
```

### In Arbitrary Values

```html
<div class="rounded-[calc(var(--radius-xl)-1px)]">...</div>
<div class="py-[calc(--spacing(4)-1px)]">...</div>
```
