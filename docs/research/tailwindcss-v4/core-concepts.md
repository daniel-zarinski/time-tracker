---
title: "Tailwind CSS v4 — Core Concepts"
source:
  - url: "https://tailwindcss.com/docs/styling-with-utility-classes"
    title: "Styling with Utility Classes"
  - url: "https://tailwindcss.com/docs/hover-focus-and-other-states"
    title: "Hover, Focus, and Other States"
  - url: "https://tailwindcss.com/docs/responsive-design"
    title: "Responsive Design"
  - url: "https://tailwindcss.com/docs/dark-mode"
    title: "Dark Mode"
  - url: "https://tailwindcss.com/docs/detecting-classes-in-source-files"
    title: "Detecting Classes in Source Files"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, utility-first, responsive, dark-mode, variants]
---

# Tailwind CSS v4 — Core Concepts

## Overview

Tailwind CSS is a utility-first CSS framework that lets you style elements by composing small, single-purpose classes directly in your markup. This document covers the foundational concepts needed to work effectively with Tailwind v4: the utility-first philosophy, state variants, responsive design, dark mode, and how Tailwind detects classes in your source files.

## Utility-First Approach

Rather than writing custom CSS classes like `.btn-primary` or `.card`, you compose pre-built utility classes directly in your HTML. Each class maps to a single CSS declaration.

```html
<div class="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg">
  <img class="size-12 shrink-0" src="/logo.svg" alt="Logo" />
  <div>
    <div class="text-xl font-medium text-black">Title</div>
    <p class="text-gray-500">Description</p>
  </div>
</div>
```

### How It Differs from Traditional CSS

| Aspect | Traditional CSS | Tailwind Utility-First |
|--------|----------------|------------------------|
| **Workflow** | Name class → switch to CSS file → write styles | Add utility classes directly in HTML |
| **Safety** | Changing CSS may break other pages | Utilities only affect their specific element |
| **CSS Growth** | Grows linearly with features | Stays constant — reuse same utilities |
| **Maintenance** | Hunt for rules across files | Styling lives with structure |

### Advantages over Inline Styles

Utility classes beat inline styles in three key areas:

1. **Design constraints** — Values come from a predefined design system (e.g., `p-4` = `1rem` from the spacing scale), ensuring visual consistency.
2. **State variants** — Can respond to hover, focus, and other pseudo-states (inline styles cannot).
3. **Responsive design** — Media queries via breakpoint prefixes (inline styles cannot).

### Arbitrary Values

For one-off values outside the design system, use square-bracket syntax:

```html
<!-- One-off color -->
<button class="bg-[#316ff6]">Sign in with Facebook</button>

<!-- One-off grid template -->
<div class="grid grid-cols-[24rem_2.5rem_minmax(0,1fr)]">...</div>

<!-- Dynamic calc value -->
<div class="max-h-[calc(100dvh-(--spacing(6)))]">...</div>

<!-- CSS custom property with responsive variant -->
<div class="[--gutter-width:1rem] lg:[--gutter-width:2rem]">...</div>
```

### Managing Duplication

Avoid premature abstraction. When repetition appears:

- **Loops** — Render repeated elements from data (no source duplication).
- **Components** — Create React/Vue components or template partials for complex UI.
- **`@layer components`** — Use CSS layers for simple patterns when components feel heavy-handed.

```css
@layer components {
  .btn-primary {
    background-color: var(--color-violet-500);
    padding: var(--spacing-2) var(--spacing-5);
    border-radius: var(--radius-md);
  }
}
```

### Avoiding Conflicts

Only apply one utility per CSS property on a single element:

```html
<!-- ❌ Conflicting — only one will win -->
<div class="grid flex">

<!-- ✅ Pick one -->
<div class="flex">
```

Use the `!` modifier sparingly when you must override specificity:

```html
<div class="bg-teal-500 bg-red-500!">Always red</div>
```

---

## State Variants

Tailwind applies styles conditionally using **variant prefixes** — short prefixes that target specific element states. Variants are composable and can be stacked.

### Interactive States

```html
<button class="bg-violet-500 hover:bg-violet-600 focus:outline-2 active:bg-violet-700">
  Save changes
</button>
```

| Variant | Condition |
|---------|-----------|
| `hover:` | Mouse hover |
| `focus:` | Element has focus |
| `focus-visible:` | Focused via keyboard |
| `active:` | Being pressed |
| `visited:` | Link already visited |
| `target:` | ID matches URL fragment |

### Structural Pseudo-Classes

```html
<!-- Remove padding from first/last list items -->
<ul>
  <li class="py-4 first:pt-0 last:pb-0">Item</li>
</ul>

<!-- Alternating row colors -->
<tr class="odd:bg-white even:bg-gray-50">
  <td>Row content</td>
</tr>
```

### Form State Variants

```html
<input
  type="text"
  class="invalid:border-pink-500 invalid:text-pink-600
         focus:border-sky-500 disabled:border-gray-200
         disabled:bg-gray-50 required:border-orange-400"
/>
```

| Variant | Condition |
|---------|-----------|
| `disabled:` | Input is disabled |
| `required:` | Input is required |
| `invalid:` / `valid:` | Validation state |
| `checked:` | Checkbox/radio is checked |
| `placeholder-shown:` | Placeholder is visible |
| `read-only:` | Input is read-only |

### Group Variants (Parent State)

Mark a parent element with `group` and use `group-*` variants on its children:

```html
<a href="#" class="group rounded-lg p-4 hover:bg-indigo-600">
  <svg class="stroke-sky-500 group-hover:stroke-white">...</svg>
  <h3 class="text-gray-900 group-hover:text-white">New project</h3>
  <p class="text-gray-500 group-hover:text-white">Description text</p>
</a>
```

For nested groups, use named groups:

```html
<li class="group/item hover:bg-gray-100">
  <a class="group/edit invisible group-hover/item:visible" href="#">
    <span class="group-hover/edit:text-gray-700">Call</span>
  </a>
</li>
```

### Peer Variants (Sibling State)

Mark a sibling element with `peer` and use `peer-*` variants on a following element:

```html
<label>
  <input type="email" class="peer border rounded-md px-3 py-2" />
  <p class="invisible peer-invalid:visible text-pink-500 text-sm">
    Please provide a valid email address.
  </p>
</label>
```

Named peers allow targeting specific siblings:

```html
<input id="draft" class="peer/draft" type="radio" name="status" />
<label for="draft" class="peer-checked/draft:text-sky-500">Draft</label>
```

### Pseudo-Elements

```html
<!-- ::before and ::after content -->
<span class="after:ml-0.5 after:text-red-500 after:content-['*']">
  Email
</span>

<!-- Text selection highlight -->
<div class="selection:bg-fuchsia-300 selection:text-fuchsia-900">
  Selectable text with custom highlight color
</div>

<!-- Input placeholder -->
<input class="placeholder:text-gray-400" placeholder="Enter name..." />
```

### Attribute-Based Variants

```html
<!-- ARIA attributes -->
<div aria-checked="true" class="aria-checked:bg-sky-700">Checked</div>

<!-- Data attributes (boolean) -->
<div data-active class="data-active:border-purple-500">Active</div>

<!-- Data attributes (value) -->
<div data-size="large" class="data-[size=large]:p-8">Large</div>
```

### Composing Multiple Variants

Variants stack — apply them left to right:

```html
<!-- Dark mode + medium breakpoint + hover -->
<button class="dark:md:hover:bg-fuchsia-600">Save changes</button>

<!-- Hover only when not focused -->
<button class="bg-indigo-600 hover:not-focus:bg-indigo-700">Click me</button>
```

### Arbitrary/Custom Variants

```html
<!-- Custom selector -->
<li class="[&.is-dragging]:cursor-grabbing">Draggable item</li>

<!-- Target descendants -->
<div class="[&_p]:mt-4">All nested p elements get margin-top</div>
```

Define reusable custom variants in CSS:

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

---

## Responsive Design

Tailwind uses a **mobile-first breakpoint system**. Unprefixed utilities apply to all screen sizes; prefixed utilities apply at that breakpoint and above.

### Default Breakpoints

| Prefix | Min-Width | Pixels |
|--------|-----------|--------|
| `sm:` | 40rem | 640px |
| `md:` | 48rem | 768px |
| `lg:` | 64rem | 1024px |
| `xl:` | 80rem | 1280px |
| `2xl:` | 96rem | 1536px |

### Mobile-First Approach

Design for mobile first, then progressively enhance for larger screens:

```html
<!-- ✅ Correct: center on mobile, left-align at sm+ -->
<div class="text-center sm:text-left">...</div>

<!-- ❌ Wrong: never centered on mobile -->
<div class="sm:text-center">...</div>
```

### Practical Example

```html
<div class="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img
        class="h-48 w-full object-cover md:h-full md:w-48"
        src="/img/building.jpg"
        alt="Modern building"
      />
    </div>
    <div class="p-8">
      <div class="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
        Company retreats
      </div>
      <a href="#" class="mt-1 block text-lg leading-tight font-medium text-black hover:underline">
        Incredible accommodation for your team
      </a>
    </div>
  </div>
</div>
```

- Default: stacked layout, full-width image
- At `md` (768px+): side-by-side flex layout with constrained image

### Targeting Breakpoint Ranges

Stack a responsive variant with a `max-*` variant to target a specific range:

```html
<!-- Apply only between md and xl (768px–1280px) -->
<div class="md:max-xl:flex">...</div>

<!-- Apply only at md, stop at lg -->
<div class="md:max-lg:flex">...</div>
```

| `max-*` Variant | Media Query |
|-----------------|-------------|
| `max-sm:` | `width < 40rem` |
| `max-md:` | `width < 48rem` |
| `max-lg:` | `width < 64rem` |
| `max-xl:` | `width < 80rem` |
| `max-2xl:` | `width < 96rem` |

### Custom Breakpoints

Define custom breakpoints using theme variables in your CSS:

```css
@import "tailwindcss";

@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-3xl: 120rem;
}
```

```html
<div class="grid xs:grid-cols-2 3xl:grid-cols-6">...</div>
```

Remove a default breakpoint:

```css
@theme {
  --breakpoint-2xl: initial;
}
```

Reset all defaults and define from scratch:

```css
@theme {
  --breakpoint-*: initial;
  --breakpoint-tablet: 40rem;
  --breakpoint-laptop: 64rem;
  --breakpoint-desktop: 80rem;
}
```

### Arbitrary Breakpoints

For one-off breakpoints:

```html
<div class="min-[320px]:text-center max-[600px]:bg-sky-300">...</div>
```

### Required Setup

Add the viewport meta tag to your HTML `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

## Dark Mode

Tailwind's `dark:` variant conditionally applies styles when dark mode is active. By default it uses `prefers-color-scheme`, but can be configured for manual control.

### Default: System Preference

The `dark:` prefix applies styles when the OS is in dark mode:

```html
<div class="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 shadow-md">
  <h3 class="text-gray-900 dark:text-white text-xl font-semibold">
    Heading text
  </h3>
  <p class="text-gray-500 dark:text-gray-400 mt-2">
    Supporting description text.
  </p>
</div>
```

### Class-Based Strategy (Manual Toggle)

Override the `dark` variant to activate on a CSS class:

```css
/* app.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Add the `dark` class to `<html>` to enable dark mode:

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">...</div>
  </body>
</html>
```

### Data Attribute Strategy

Use a data attribute instead of a class:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```html
<html data-theme="dark">
  <body>
    <div class="bg-white dark:bg-black">...</div>
  </body>
</html>
```

### Three-Way Toggle (System / Light / Dark)

Implement user-controlled theme selection with localStorage:

```javascript
// Apply on page load (before render to avoid flash)
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);

// User selects light mode
localStorage.theme = "light";
document.documentElement.classList.remove("dark");

// User selects dark mode
localStorage.theme = "dark";
document.documentElement.classList.add("dark");

// User follows system preference
localStorage.removeItem("theme");
```

---

## Content Detection (Class Scanning)

Tailwind v4 scans project files as **plain text** to find utility class names, then generates only the CSS for classes it finds. Understanding this system prevents common "class not generated" bugs.

### What Gets Scanned (Default)

Tailwind automatically scans everything **except**:
- Files listed in `.gitignore`
- `node_modules/` directory
- Binary files (images, videos, archives)
- CSS files themselves
- Package manager lock files

### The `@source` Directive

Use `@source` to explicitly include paths that are excluded by default (e.g., UI library packages in `node_modules`):

```css
@import "tailwindcss";
@source "../node_modules/@acmecorp/ui-lib";
```

Set a custom base path (useful in monorepos):

```css
@import "tailwindcss" source("../src");
```

Exclude specific paths:

```css
@import "tailwindcss";
@source not "../src/components/legacy";
```

Disable automatic detection entirely:

```css
@import "tailwindcss" source(none);
@source "../admin";
@source "../shared";
```

### Critical: Class Names Must Be Static

Tailwind scans as text — it cannot evaluate JavaScript expressions. Class names must be complete and literal in your source code.

```jsx
// ❌ Will NOT work — Tailwind can't see "red" or "green" as class names
<div class={`text-${error ? 'red' : 'green'}-600`}>...</div>

// ✅ Works — complete class names are present in source
<div class={error ? 'text-red-600' : 'text-green-600'}>...</div>
```

For component props, map values to complete class strings:

```jsx
function Button({ color, children }) {
  const colorVariants = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    red: "bg-red-600 hover:bg-red-500 text-white",
    green: "bg-green-600 hover:bg-green-500 text-white",
  };
  return <button className={colorVariants[color]}>{children}</button>;
}
```

### Safelisting with `@source inline()`

Force generation of classes that don't appear in any source file:

```css
/* Single class */
@source inline("underline");

/* With variants */
@source inline("{hover:,focus:,}underline");

/* Color scale range */
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
/* Generates: bg-red-50, bg-red-100, bg-red-200, ..., bg-red-900, bg-red-950 */
/* And hover variants for each */
```

Exclude specific classes from generation:

```css
@source not inline("{hover:,focus:,}bg-red-{50,{100..900..100},950}");
```

### Summary

| Situation | Solution |
|-----------|----------|
| Class in scanned file | Works automatically |
| Class in `node_modules` | Add `@source "../node_modules/package"` |
| Dynamically constructed class name | Refactor to use complete static class names |
| Class not in any source file | Use `@source inline("class-name")` |
| Need to exclude a path | Use `@source not "path"` |
