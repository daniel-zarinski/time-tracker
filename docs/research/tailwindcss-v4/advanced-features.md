---
title: "Tailwind CSS v4 — Advanced Features"
source:
  - url: "https://tailwindcss.com/docs/adding-custom-styles"
    title: "Adding Custom Styles"
  - url: "https://tailwindcss.com/docs/functions-and-directives"
    title: "Functions and Directives"
  - url: "https://tailwindcss.com/docs/hover-focus-and-other-states"
    title: "Hover, Focus, and Other States"
  - url: "https://tailwindcss.com/docs/detecting-classes-in-source-files"
    title: "Detecting Classes in Source Files"
  - url: "https://tailwindcss.com/blog/tailwindcss-v4"
    title: "Tailwind CSS v4.0"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, advanced, custom-utilities, variants, directives, plugins]
---

# Tailwind CSS v4 — Advanced Features

## Overview

Tailwind CSS v4 introduces a set of advanced extension points that let you build custom utilities, variants, and plugins using only CSS — no JavaScript required. This document covers the new variant additions in v4, the `@utility` and `@custom-variant` directives, the complete directives and functions reference, and strategies for controlling source detection and build optimization.

## New Variants in v4

### `not-*` — Negate Conditions

Apply styles when an element does **not** match a state or query:

```html
<!-- Fade when NOT hovered -->
<div class="not-hover:opacity-75">Hover to see full opacity</div>

<!-- Padding when a feature is NOT supported -->
<div class="not-supports-hanging-punctuation:px-4">Fallback padding</div>

<!-- Light mode only -->
<div class="not-dark:text-gray-900">Light mode text</div>
```

Generated CSS:

```css
.not-hover\:opacity-75:not(*:hover) {
  opacity: 75%;
}
```

### `inert` — Non-Interactive Elements

Style elements that are marked as `inert` (non-interactive):

```html
<div inert class="inert:opacity-50 inert:cursor-not-allowed">
  This content is inert
</div>
```

### `nth-*` — Positional Selection

Target specific child elements with nth-child selectors:

```html
<!-- Third child -->
<li class="nth-3:bg-red-500">Item</li>

<!-- Every 2nd child starting from 1 -->
<li class="nth-[2n+1]:bg-gray-100">Odd item</li>

<!-- Last 3 items -->
<li class="nth-last-3:font-bold">Near end</li>
```

### `in-*` — Ancestor State (Without `group`)

Like `group-*` variants, but without needing to add the `group` class to the parent. Targets when the element is inside a matching ancestor:

```html
<!-- No group class needed on parent -->
<a href="#" class="in-[.active-section]:text-blue-600">Link</a>

<!-- With named variant -->
<div class="in-data-active:text-purple-500">Content</div>
```

### `open` — Popovers and Dialogs

Style `<details>`, `<dialog>`, and popover elements when open:

```html
<details class="open:shadow-lg">
  <summary>Toggle</summary>
  <p>Revealed content</p>
</details>

<div
  popover
  id="my-popover"
  class="opacity-100 transition-discrete starting:open:opacity-0 open:opacity-100"
>
  Popover with enter transition
</div>
```

### `**` — Descendant Variant

Style all descendant elements:

```html
<!-- All descendants get the style -->
<div class="**:text-sm **:text-gray-700">
  <p>This paragraph</p>
  <span>And this span</span>
</div>
```

---

## Custom Utilities

### Simple Utilities with `@utility`

The `@utility` directive creates custom utility classes that work with all Tailwind variants (hover, focus, responsive breakpoints, dark mode, etc.). This replaces the v3 `@layer utilities` pattern.

```css
/* Simple single-property utility */
@utility content-auto {
  content-visibility: auto;
}

/* Utility with nested selectors */
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

Usage in HTML — variants work automatically:

```html
<div class="content-auto hover:content-auto lg:content-auto">...</div>
<div class="scrollbar-hidden">...</div>
```

### Functional (Parameterized) Utilities

Register utilities that accept dynamic values using `@utility name-*`:

```css
/* Tab size utility accepting theme values or integers */
@utility tab-* {
  tab-size: --value(--tab-size-*, integer);
}
```

```html
<pre class="tab-4">...</pre>
<pre class="tab-8">...</pre>
```

**Value resolution options:**

| Syntax | Resolves From |
|--------|--------------|
| `--value(--theme-key-*)` | Theme CSS variable namespace |
| `--value(integer)` | Bare integer (e.g., `tab-4`) |
| `--value('literal')` | Quoted literal string |
| `--value([type])` | Arbitrary value in brackets |
| `--value(--theme-*, integer, [integer])` | Multiple forms combined |

**Supported arbitrary value types:** `color`, `length`, `percentage`, `angle`, `number`, `integer`, `url`, `image`, `position`, `ratio`, and more.

### Utilities with Negative Values

```css
@utility inset-* {
  inset: --spacing(--value(integer));
  inset: --value([percentage], [length]);
}

@utility -inset-* {
  inset: --spacing(--value(integer) * -1);
  inset: calc(--value([percentage], [length]) * -1);
}
```

```html
<div class="inset-4">Positive inset</div>
<div class="-inset-4">Negative inset</div>
```

### Utilities with Modifiers

Modifiers allow a slash-based modifier (e.g., `text-lg/tight`):

```css
@utility text-* {
  font-size: --value(--text-*, [length]);
  line-height: --modifier(--leading-*, [length], [*]);
}
```

```html
<p class="text-lg/tight">Large text, tight line height</p>
<p class="text-sm/6">Small text, explicit line height</p>
```

---

## Custom Variants

### `@custom-variant` — Reusable Selector Patterns

Create custom variants for patterns you use repeatedly:

```css
/* Full form with @slot for the utility's styles */
@custom-variant theme-midnight {
  &:where([data-theme="midnight"] *) {
    @slot;
  }
}

/* Shorthand (for single selector patterns) */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

```html
<html data-theme="midnight">
  <button class="theme-midnight:bg-black theme-midnight:text-white">
    Dark theme button
  </button>
</html>
```

### Media Query Variants

```css
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}
```

```html
<button class="any-hover:bg-blue-500">Hover (any input)</button>
```

### Dark Mode Configuration

Override the `dark` variant using `@custom-variant`:

```css
/* Class-based dark mode */
@custom-variant dark (&:where(.dark, .dark *));

/* Data attribute-based dark mode */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

### `@variant` — In Custom CSS

Apply existing Tailwind variants to styles inside custom CSS:

```css
.my-element {
  background: white;

  @variant dark {
    background: black;
  }

  @variant hover {
    background: gray;
  }
}

/* Nest variants for combined conditions */
.my-element {
  @variant dark {
    @variant hover {
      background: #1a1a1a;
    }
  }
}
```

---

## Arbitrary Values and Properties

### Arbitrary Values

Use square bracket notation for one-off values not in the design system:

```html
<!-- Position -->
<div class="top-[117px] lg:top-[344px]">...</div>

<!-- Color -->
<div class="bg-[#bada55] text-[22px]">...</div>

<!-- Content string -->
<span class="before:content-['Festivus']">...</span>

<!-- CSS variable (parenthesis shorthand) -->
<div class="fill-(--my-brand-color)">...</div>

<!-- calc() with spacing function -->
<div class="py-[calc(--spacing(4)-1px)]">...</div>
```

### Arbitrary Properties

Write any CSS property not covered by built-in utilities:

```html
<!-- CSS property -->
<div class="[mask-type:luminance] hover:[mask-type:alpha]">...</div>

<!-- CSS custom property (responsive) -->
<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">...</div>
```

### Arbitrary Variants

Apply custom selector logic inline:

```html
<!-- Target nth children with breakpoint variant -->
<li class="lg:[&:nth-child(-n+3)]:hover:underline">Item</li>

<!-- Target a specific parent state -->
<div class="[.is-active_&]:text-blue-500">Active child</div>

<!-- Target all p descendants -->
<div class="[&_p]:mt-4">Wrapper</div>
```

### Resolving Ambiguous CSS Variables

When a CSS variable could be interpreted as multiple utility types, use type hints:

```html
<!-- Treat as a length value for font-size -->
<div class="text-(length:--my-var)">...</div>

<!-- Treat as a color -->
<div class="text-(color:--my-var)">...</div>
```

### Whitespace in Arbitrary Values

Use underscores where CSS expects spaces:

```html
<!-- Grid template -->
<div class="grid-cols-[1fr_500px_2fr]">...</div>

<!-- Background URL (underscores in URLs are preserved) -->
<div class="bg-[url('/what_a_rush.png')]">...</div>

<!-- Escape literal underscore -->
<span class="before:content-['hello\_world']">...</span>
```

---

## Directives Reference

### `@import`

Inline CSS files including Tailwind itself. Supports build-time bundling via Lightning CSS — no `postcss-import` needed.

```css
@import "tailwindcss";
@import "./typography.css";
@import "./components.css";
```

### `@theme`

Define custom design tokens. All values become CSS custom properties.

```css
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-brand: oklch(0.55 0.2 260);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}
```

Remove a default token by setting it to `initial`:

```css
@theme {
  --breakpoint-2xl: initial;  /* Remove the 2xl breakpoint */
  --breakpoint-*: initial;    /* Remove all breakpoints */
}
```

### `@source`

Explicitly control which files Tailwind scans for class names.

```css
/* Include a path auto-excluded by .gitignore or node_modules */
@source "../node_modules/@my-company/ui-lib";

/* Set base path (useful in monorepos) */
@import "tailwindcss" source("../src");

/* Exclude a specific path */
@source not "../src/components/legacy";

/* Disable auto-detection entirely */
@import "tailwindcss" source(none);
@source "../admin";
@source "../shared";

/* Safelist classes not in source files */
@source inline("underline");
@source inline("{hover:,focus:,}underline");
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
```

### `@utility`

Register custom utility classes that work with all variants.

```css
@utility content-auto {
  content-visibility: auto;
}

@utility tab-* {
  tab-size: --value(integer);
}
```

### `@custom-variant`

Define custom variants for reuse across the project.

```css
/* Shorthand */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));

/* Full form with @slot */
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}
```

### `@variant`

Apply Tailwind variants inside custom CSS blocks.

```css
.card {
  background: white;
  @variant dark { background: black; }
  @variant hover { transform: translateY(-2px); }
}
```

### `@apply`

Inline existing utility classes into custom CSS:

```css
.select2-dropdown {
  @apply rounded-b-lg shadow-md;
}

.btn {
  @apply rounded-lg px-4 py-2 font-medium;
}
```

### `@reference`

Import theme and utilities as a reference (no CSS output duplication). Use in Vue/Svelte `<style>` blocks or CSS modules:

```vue
<style scoped>
  @reference "../../app.css";

  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>
```

Or reference Tailwind directly:

```css
@reference "tailwindcss";
```

### `@config`

Load a legacy JavaScript configuration file:

```css
@config "../../tailwind.config.js";
```

Note: `corePlugins`, `safelist`, and `separator` options are not supported in v4.

### `@plugin`

Load a JavaScript-based Tailwind plugin:

```css
@plugin "@tailwindcss/typography";
@plugin "./my-local-plugin.js";
```

---

## Functions Reference

### `--spacing()`

Generate spacing values based on the spacing scale (`--spacing` CSS variable):

```css
.my-element {
  margin: --spacing(4);    /* calc(var(--spacing) * 4) = 1rem */
  padding: --spacing(6);   /* calc(var(--spacing) * 6) = 1.5rem */
}
```

In arbitrary values:

```html
<div class="py-[calc(--spacing(4)-1px)]">...</div>
```

### `--alpha()`

Adjust color opacity using `color-mix()`:

```css
.my-element {
  /* Input */
  color: --alpha(var(--color-lime-300) / 50%);

  /* Output */
  color: color-mix(in oklab, var(--color-lime-300) 50%, transparent);
}
```

### `theme()` (Compatibility)

Access theme values using dot notation. **Deprecated** — prefer CSS variables.

```css
/* Old (still works) */
.my-element {
  margin: theme(spacing.12);
  background: theme(colors.blue.500);
}

/* New (preferred) */
.my-element {
  margin: var(--spacing-12);
  background: var(--color-blue-500);
}
```

Still useful for places where CSS variables aren't accepted:

```css
@media (width >= theme(--breakpoint-xl)) {
  /* ... */
}
```

---

## Custom Base Styles

Use `@layer base` for element-level default styles:

```css
@layer base {
  h1 { font-size: var(--text-2xl); }
  h2 { font-size: var(--text-xl); }
  h3 { font-size: var(--text-lg); }

  a {
    color: var(--color-blue-600);
    text-decoration: underline;
  }
}
```

## Custom Component Classes

Use `@layer components` for multi-property reusable patterns:

```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-xl);
  }

  .btn-primary {
    background-color: var(--color-violet-500);
    color: var(--color-white);
    padding: --spacing(2) --spacing(5);
    border-radius: var(--radius-md);
  }
}
```

Utility classes can override component styles:

```html
<!-- Override card's default border-radius -->
<div class="card rounded-none">Flat card</div>
```

---

## Plugins

### Loading Official Plugins

```css
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/aspect-ratio";
```

### Loading Local Plugins

```css
@plugin "./my-plugin.js";
```

A plugin file uses the same JS API as v3 plugins but is loaded via `@plugin`:

```javascript
// my-plugin.js
import plugin from "tailwindcss/plugin";

export default plugin(function ({ addUtilities, addVariant }) {
  addUtilities({
    ".content-auto": { "content-visibility": "auto" },
  });

  addVariant("theme-midnight", "&:where([data-theme='midnight'] *)");
});
```

---

## Accessing Theme Values in JavaScript

Since `resolveConfig()` was removed in v4, access theme values via CSS custom properties:

```javascript
// Read a CSS variable at runtime
const styles = getComputedStyle(document.documentElement);
const shadowXl = styles.getPropertyValue("--shadow-xl");
const colorBlue500 = styles.getPropertyValue("--color-blue-500");
```

With animation libraries that support CSS variables:

```jsx
// Framer Motion
<motion.div animate={{ backgroundColor: "var(--color-blue-500)" }} />
```

---

## Subpath Imports

All CSS directives support package.json `imports` field aliases:

```json
// package.json
{
  "imports": {
    "#app.css": "./src/css/app.css"
  }
}
```

```css
/* Use the alias */
@reference "#app.css";
@import "#app.css";
```

---

## Production Optimization

### Default Scan Behavior

Tailwind scans all non-ignored project files automatically. Files excluded:
- `.gitignore` entries
- `node_modules/`
- Binary files
- CSS files
- Lock files

### Controlling Scan Scope

For optimal builds in monorepos or when auto-detection is too broad:

```css
/* Only scan a specific directory */
@import "tailwindcss" source("../src");

/* Disable auto-detection, explicitly list everything */
@import "tailwindcss" source(none);
@source "../src/components";
@source "../src/pages";
@source "../node_modules/@acme/ui-kit";
```

### Ensuring Static Class Names

Tailwind scans as plain text. Always use complete class names — never construct them dynamically:

```jsx
// ❌ Dynamic construction — class won't be detected
const cls = `text-${size}-600`;

// ✅ Complete static strings — always detected
const cls = size === "lg" ? "text-lg-600" : "text-sm-600";

// ✅ Lookup table pattern
const sizeMap = {
  sm: "text-sm text-gray-600",
  lg: "text-lg text-gray-800",
};
```

### Safelisting for Dynamic Content

Force generation of classes that don't appear in source:

```css
/* Single class */
@source inline("underline");

/* Class with variants */
@source inline("{hover:,focus:,}underline");

/* Color range */
@source inline("bg-red-{50,100,200,300,400,500,600,700,800,900,950}");

/* Range shorthand (100 to 900 in steps of 100) */
@source inline("bg-red-{50,{100..900..100},950}");
```
