---
title: "Tailwind CSS v4 — Layout & Spacing"
source:
  - url: "https://tailwindcss.com/docs/display"
    title: "Display — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/flex-direction"
    title: "Flex Direction — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/flex"
    title: "Flex — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/grid-template-columns"
    title: "Grid Template Columns — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/gap"
    title: "Gap — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/padding"
    title: "Padding — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/width"
    title: "Width — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/container"
    title: "Container — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/position"
    title: "Position — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/top-right-bottom-left"
    title: "Top / Right / Bottom / Left — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/overflow"
    title: "Overflow — Tailwind CSS"
  - url: "https://tailwindcss.com/blog/tailwindcss-v4"
    title: "Tailwind CSS v4.0 — Tailwind CSS Blog"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, layout, spacing, flexbox, grid, container-queries, positioning]
---

# Tailwind CSS v4 — Layout & Spacing

## Overview

Tailwind CSS v4 provides a complete set of layout and spacing utilities for controlling display, flexbox, CSS Grid, positioning, sizing, and spacing. A key architectural change in v4 is that the spacing scale is driven by a `--spacing` CSS variable, and container queries are now built-in (no plugin required). All spacing utilities — padding, margin, gap, inset — use `calc(var(--spacing) * <number>)` for consistent, customizable scaling.

## Display

The `display` utilities control how an element is rendered in the document flow.

### Common Display Classes

| Class | CSS |
|-------|-----|
| `block` | `display: block;` |
| `inline` | `display: inline;` |
| `inline-block` | `display: inline-block;` |
| `flex` | `display: flex;` |
| `inline-flex` | `display: inline-flex;` |
| `grid` | `display: grid;` |
| `inline-grid` | `display: inline-grid;` |
| `flow-root` | `display: flow-root;` |
| `contents` | `display: contents;` |
| `hidden` | `display: none;` |
| `list-item` | `display: list-item;` |

### Table Display Classes

| Class | CSS |
|-------|-----|
| `table` | `display: table;` |
| `table-row` | `display: table-row;` |
| `table-cell` | `display: table-cell;` |
| `table-caption` | `display: table-caption;` |

### Accessibility

```html
<!-- Visually hidden, accessible to screen readers -->
<a href="#">
  <svg><!-- icon --></svg>
  <span class="sr-only">Settings</span>
</a>

<!-- Undo sr-only -->
<span class="not-sr-only">Visible again</span>
```

### Responsive Display

```html
<!-- Block on mobile, inline-flex on md and up -->
<div class="block md:inline-flex">...</div>

<!-- Visible on md and up, hidden on mobile -->
<div class="hidden md:block">...</div>
```

## Flexbox

Apply `flex` (or `inline-flex`) to a parent, then use flex child utilities on its direct children.

### Flex Container

```html
<div class="flex items-center gap-4">
  <img class="size-12 rounded-full" src="..." />
  <div>
    <strong>Name</strong>
    <span class="text-gray-500">Role</span>
  </div>
</div>
```

### flex-direction

| Class | CSS |
|-------|-----|
| `flex-row` | `flex-direction: row;` (default) |
| `flex-row-reverse` | `flex-direction: row-reverse;` |
| `flex-col` | `flex-direction: column;` |
| `flex-col-reverse` | `flex-direction: column-reverse;` |

```html
<!-- Column on mobile, row on md+ -->
<div class="flex flex-col md:flex-row gap-4">
  <aside>Sidebar</aside>
  <main>Content</main>
</div>
```

### flex-wrap

| Class | CSS |
|-------|-----|
| `flex-nowrap` | `flex-wrap: nowrap;` (default) |
| `flex-wrap` | `flex-wrap: wrap;` |
| `flex-wrap-reverse` | `flex-wrap: wrap-reverse;` |

### flex (shorthand)

| Class | CSS |
|-------|-----|
| `flex-1` | `flex: 1;` (grow and shrink freely) |
| `flex-auto` | `flex: auto;` (grow/shrink based on content) |
| `flex-initial` | `flex: 0 auto;` (default: shrink but don't grow) |
| `flex-none` | `flex: none;` (neither grow nor shrink) |
| `flex-[3_1_auto]` | `flex: 3 1 auto;` (arbitrary) |

```html
<div class="flex gap-4">
  <div class="flex-none w-16">Fixed</div>
  <div class="flex-1">Grows to fill remaining space</div>
  <div class="flex-1">Also grows equally</div>
</div>
```

### flex-grow / flex-shrink

| Class | CSS |
|-------|-----|
| `grow` | `flex-grow: 1;` |
| `grow-0` | `flex-grow: 0;` |
| `shrink` | `flex-shrink: 1;` |
| `shrink-0` | `flex-shrink: 0;` |

### Alignment

**justify-content** (main axis):

| Class | CSS |
|-------|-----|
| `justify-start` | `justify-content: flex-start;` |
| `justify-end` | `justify-content: flex-end;` |
| `justify-center` | `justify-content: center;` |
| `justify-between` | `justify-content: space-between;` |
| `justify-around` | `justify-content: space-around;` |
| `justify-evenly` | `justify-content: space-evenly;` |
| `justify-stretch` | `justify-content: stretch;` |

**align-items** (cross axis):

| Class | CSS |
|-------|-----|
| `items-start` | `align-items: flex-start;` |
| `items-end` | `align-items: flex-end;` |
| `items-center` | `align-items: center;` |
| `items-baseline` | `align-items: baseline;` |
| `items-stretch` | `align-items: stretch;` |

**align-self** (individual child):

| Class | CSS |
|-------|-----|
| `self-auto` | `align-self: auto;` |
| `self-start` | `align-self: flex-start;` |
| `self-end` | `align-self: flex-end;` |
| `self-center` | `align-self: center;` |
| `self-stretch` | `align-self: stretch;` |

**align-content** (multi-line cross axis):

`content-start`, `content-end`, `content-center`, `content-between`, `content-around`, `content-evenly`, `content-baseline`, `content-stretch`

### Center Anything with Flexbox

```html
<!-- Perfect centering -->
<div class="flex items-center justify-center min-h-screen">
  <div>Centered content</div>
</div>
```

## CSS Grid

Apply `grid` to a parent, then configure columns, rows, and placement.

### grid-template-columns

| Class | CSS |
|-------|-----|
| `grid-cols-1` | `grid-template-columns: repeat(1, minmax(0, 1fr));` |
| `grid-cols-3` | `grid-template-columns: repeat(3, minmax(0, 1fr));` |
| `grid-cols-12` | `grid-template-columns: repeat(12, minmax(0, 1fr));` |
| `grid-cols-none` | `grid-template-columns: none;` |
| `grid-cols-subgrid` | `grid-template-columns: subgrid;` |
| `grid-cols-[200px_1fr]` | Arbitrary value |

```html
<!-- 4-column grid -->
<div class="grid grid-cols-4 gap-4">
  <div>01</div><div>02</div><div>03</div><div>04</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- cards -->
</div>
```

### grid-template-rows

| Class | CSS |
|-------|-----|
| `grid-rows-3` | `grid-template-rows: repeat(3, minmax(0, 1fr));` |
| `grid-rows-none` | `grid-template-rows: none;` |
| `grid-rows-subgrid` | `grid-template-rows: subgrid;` |

### grid-column / grid-row (Spanning)

| Class | CSS |
|-------|-----|
| `col-span-2` | `grid-column: span 2 / span 2;` |
| `col-span-full` | `grid-column: 1 / -1;` |
| `col-start-2` | `grid-column-start: 2;` |
| `col-end-4` | `grid-column-end: 4;` |
| `row-span-3` | `grid-row: span 3 / span 3;` |

```html
<!-- Dashboard grid layout -->
<div class="grid grid-cols-12 gap-4">
  <header class="col-span-12">Header</header>
  <nav class="col-span-3">Sidebar</nav>
  <main class="col-span-9">Main content</main>
  <footer class="col-span-12">Footer</footer>
</div>
```

### grid-auto-flow

| Class | CSS |
|-------|-----|
| `grid-flow-row` | `grid-auto-flow: row;` |
| `grid-flow-col` | `grid-auto-flow: column;` |
| `grid-flow-dense` | `grid-auto-flow: dense;` |
| `grid-flow-row-dense` | `grid-auto-flow: row dense;` |
| `grid-flow-col-dense` | `grid-auto-flow: column dense;` |

### Subgrid

```html
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-3 grid grid-cols-subgrid gap-4">
    <div class="col-start-2">Aligned to parent grid</div>
  </div>
</div>
```

### Gap

| Class | CSS |
|-------|-----|
| `gap-4` | `gap: calc(var(--spacing) * 4);` |
| `gap-x-8` | `column-gap: calc(var(--spacing) * 8);` |
| `gap-y-4` | `row-gap: calc(var(--spacing) * 4);` |
| `gap-[10vw]` | Arbitrary value |
| `gap-(--my-gap)` | CSS variable |

```html
<!-- Different horizontal and vertical gaps -->
<div class="grid grid-cols-3 gap-x-8 gap-y-4">
  <div>01</div><div>02</div><div>03</div>
</div>
```

## Container Queries (New in v4)

Container queries are **built-in** in Tailwind CSS v4 — no plugin required. The `@tailwindcss/container-queries` plugin is no longer needed.

### Setting up a container

Add `@container` to a parent element to make it a query container:

```html
<div class="@container">
  <!-- children can respond to this container's size -->
  <div class="@md:flex-row flex flex-col">...</div>
</div>
```

### Container size variants

| Variant | Equivalent width |
|---------|-----------------|
| `@xs:` | ≥ 20rem (320px) |
| `@sm:` | ≥ 24rem (384px) |
| `@md:` | ≥ 28rem (448px) |
| `@lg:` | ≥ 32rem (512px) |
| `@xl:` | ≥ 36rem (576px) |
| `@2xl:` | ≥ 42rem (672px) |

### Named containers

```html
<div class="@container/card">
  <div class="@md/card:flex-row flex flex-col">
    <!-- flex-row when the element named "card" is ≥ 28rem wide -->
  </div>
</div>
```

### Max-width container queries

```html
<!-- Hidden when container is at most md size -->
<div class="@container">
  <div class="@max-md:hidden">Shown only in large containers</div>
</div>
```

### Practical card example

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4 rounded-xl border p-4">
    <img class="size-24 @md:size-32 rounded-lg object-cover" src="..." />
    <div>
      <h2 class="text-base @md:text-xl font-semibold">Title</h2>
      <p class="text-sm @md:text-base text-gray-600">Description</p>
    </div>
  </div>
</div>
```

## The Container Utility

The `container` class sets a `max-width` matching the current breakpoint's minimum width:

```css
.container {
  width: 100%;
  /* max-width: 40rem at sm, 48rem at md, 64rem at lg, etc. */
}
```

The container does **not** auto-center — add `mx-auto` and padding manually:

```html
<div class="container mx-auto px-4">
  Page content
</div>
```

## Spacing (Padding & Margin)

All spacing utilities use `calc(var(--spacing) * <number>)`. The default `--spacing` base is `0.25rem` (4px), so `p-4` = `1rem`.

### Padding

| Class | CSS |
|-------|-----|
| `p-4` | `padding: calc(var(--spacing) * 4);` |
| `px-4` | `padding-inline: calc(var(--spacing) * 4);` |
| `py-4` | `padding-block: calc(var(--spacing) * 4);` |
| `pt-4` | `padding-top: calc(var(--spacing) * 4);` |
| `pr-4` | `padding-right: calc(var(--spacing) * 4);` |
| `pb-4` | `padding-bottom: calc(var(--spacing) * 4);` |
| `pl-4` | `padding-left: calc(var(--spacing) * 4);` |
| `ps-4` | `padding-inline-start: ...` (logical) |
| `pe-4` | `padding-inline-end: ...` (logical) |
| `p-px` | `padding: 1px;` |
| `p-[5px]` | Arbitrary value |

### Margin

| Class | CSS |
|-------|-----|
| `m-4` | `margin: calc(var(--spacing) * 4);` |
| `mx-auto` | `margin-inline: auto;` (centering) |
| `my-4` | `margin-block: calc(var(--spacing) * 4);` |
| `mt-4` | `margin-top: calc(var(--spacing) * 4);` |
| `-mt-4` | `margin-top: calc(var(--spacing) * -4);` (negative) |
| `ms-4` | `margin-inline-start: ...` (logical) |

### Logical Properties for RTL Support

```html
<!-- Left in LTR, right in RTL -->
<div class="ps-4">Start padding</div>

<!-- Right in LTR, left in RTL -->
<div class="pe-4">End padding</div>
```

### Customizing the Spacing Scale

```css
@theme {
  --spacing: 0.25rem; /* default: 4px per unit */
}

/* Or add custom spacing values */
@theme {
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;
}
```

## Sizing (Width & Height)

### Width

| Class | CSS |
|-------|-----|
| `w-4` | `width: calc(var(--spacing) * 4);` |
| `w-1/2` | `width: 50%;` |
| `w-1/3` | `width: 33.333%;` |
| `w-full` | `width: 100%;` |
| `w-screen` | `width: 100vw;` |
| `w-dvw` | `width: 100dvw;` (dynamic viewport) |
| `w-auto` | `width: auto;` |
| `w-min` | `width: min-content;` |
| `w-max` | `width: max-content;` |
| `w-fit` | `width: fit-content;` |
| `w-md` | Container scale (28rem) |
| `w-[480px]` | Arbitrary value |

### Height

| Class | CSS |
|-------|-----|
| `h-4` | `height: calc(var(--spacing) * 4);` |
| `h-full` | `height: 100%;` |
| `h-screen` | `height: 100vh;` |
| `h-dvh` | `height: 100dvh;` (dynamic viewport) |
| `h-lvh` | `height: 100lvh;` (large viewport) |
| `h-svh` | `height: 100svh;` (small viewport) |

### Combined Size

The `size-*` shorthand sets both width and height simultaneously:

```html
<div class="size-12">48px × 48px</div>
<div class="size-full">100% × 100%</div>
<div class="size-[5rem]">custom × custom</div>
```

### Min / Max Sizing

```html
<div class="min-w-0 max-w-xl">...</div>
<div class="min-h-screen max-h-96 overflow-y-auto">...</div>
```

### Logical Properties

```html
<div class="inline-size-full">/* writing-mode-aware width */</div>
<div class="block-size-24">/* writing-mode-aware height */</div>
```

## Positioning

### Position Classes

| Class | CSS |
|-------|-----|
| `static` | `position: static;` |
| `relative` | `position: relative;` |
| `absolute` | `position: absolute;` |
| `fixed` | `position: fixed;` |
| `sticky` | `position: sticky;` |

### Inset / Top / Right / Bottom / Left

| Class | CSS |
|-------|-----|
| `inset-0` | `inset: 0;` (all sides) |
| `inset-x-0` | `inset-inline: 0;` (left + right) |
| `inset-y-0` | `inset-block: 0;` (top + bottom) |
| `top-4` | `top: calc(var(--spacing) * 4);` |
| `right-4` | `right: calc(var(--spacing) * 4);` |
| `bottom-4` | `bottom: calc(var(--spacing) * 4);` |
| `left-4` | `left: calc(var(--spacing) * 4);` |
| `-top-4` | `top: calc(var(--spacing) * -4);` |
| `inset-1/2` | `inset: 50%;` |
| `inset-full` | `inset: 100%;` |

### Common Positioning Patterns

```html
<!-- Overlay that covers its parent -->
<div class="relative">
  <img src="..." />
  <div class="absolute inset-0 bg-black/50">Overlay</div>
</div>

<!-- Badge pinned to top-right corner -->
<div class="relative inline-flex">
  <button>Inbox</button>
  <span class="absolute -top-1 -right-1 size-4 rounded-full bg-red-500">3</span>
</div>

<!-- Sticky header -->
<header class="sticky top-0 z-50 bg-white shadow">Navigation</header>

<!-- Fixed floating button -->
<button class="fixed bottom-6 right-6 rounded-full bg-blue-600 p-4">+</button>

<!-- Center absolutely positioned element -->
<div class="relative h-64">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    Centered
  </div>
</div>
```

### Z-Index

| Class | CSS |
|-------|-----|
| `z-0` | `z-index: 0;` |
| `z-10` | `z-index: 10;` |
| `z-20` | `z-index: 20;` |
| `z-50` | `z-index: 50;` |
| `z-auto` | `z-index: auto;` |
| `z-[100]` | Arbitrary z-index |

## Overflow & Visibility

### Overflow

| Class | CSS |
|-------|-----|
| `overflow-auto` | `overflow: auto;` |
| `overflow-hidden` | `overflow: hidden;` |
| `overflow-clip` | `overflow: clip;` |
| `overflow-visible` | `overflow: visible;` |
| `overflow-scroll` | `overflow: scroll;` |
| `overflow-x-auto` | `overflow-x: auto;` |
| `overflow-y-auto` | `overflow-y: auto;` |
| `overflow-x-hidden` | `overflow-x: hidden;` |
| `overflow-y-hidden` | `overflow-y: hidden;` |

```html
<!-- Scrollable sidebar -->
<aside class="h-screen overflow-y-auto">...</aside>

<!-- Hide overflow on card images -->
<div class="overflow-hidden rounded-xl">
  <img src="..." class="w-full scale-110" />
</div>
```

### Visibility

```html
<div class="visible">...</div>
<div class="invisible">Hidden but takes space</div>
<div class="collapse">...</div>
```

## Practical Layout Examples

### Sidebar Layout

```html
<div class="flex min-h-screen">
  <aside class="w-64 shrink-0 border-r bg-gray-50">
    <nav class="sticky top-0 p-6">Navigation</nav>
  </aside>
  <main class="flex-1 overflow-y-auto p-8">
    Main content
  </main>
</div>
```

### Centered Content (Full Page)

```html
<div class="flex min-h-screen items-center justify-center bg-gray-100">
  <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
    Card content
  </div>
</div>
```

### Dashboard Grid

```html
<div class="grid grid-cols-12 gap-6 p-6">
  <header class="col-span-12 rounded-xl bg-white p-4 shadow">Header</header>
  <aside class="col-span-3 rounded-xl bg-white p-4 shadow">Sidebar</aside>
  <main class="col-span-9 grid grid-cols-3 gap-6">
    <div class="col-span-3 rounded-xl bg-white p-4 shadow">Stats Row</div>
    <div class="col-span-2 rounded-xl bg-white p-4 shadow">Chart</div>
    <div class="col-span-1 rounded-xl bg-white p-4 shadow">Recent</div>
  </main>
</div>
```

### Responsive Card Grid

```html
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <article class="rounded-xl border p-4">Card</article>
</div>
```

### Container Query–Responsive Card

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4 rounded-xl border p-4">
    <img class="w-full @md:w-40 @md:shrink-0 rounded-lg object-cover" src="..." />
    <div>
      <h2 class="text-base @md:text-lg font-semibold">Title</h2>
      <p class="mt-1 text-sm text-gray-500">Description text</p>
    </div>
  </div>
</div>
```
