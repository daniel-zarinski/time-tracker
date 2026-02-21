---
title: "Tailwind CSS v4 — Animations & Transforms"
source:
  - url: "https://tailwindcss.com/docs/animation"
    title: "Animation — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/transition-property"
    title: "Transition Property — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/transition-duration"
    title: "Transition Duration — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/transition-timing-function"
    title: "Transition Timing Function — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/transition-behavior"
    title: "Transition Behavior — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/rotate"
    title: "Rotate — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/perspective"
    title: "Perspective — Tailwind CSS"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, animation, transition, transform, 3d, perspective]
---

# Tailwind CSS v4 — Animations & Transforms

## Overview

Tailwind CSS v4 provides comprehensive utilities for transitions, animations, and CSS transforms — including first-class support for 3D transforms (`rotate-x-*`, `rotate-y-*`, `translate-z-*`, `perspective-*`) which are new in v4. The `transition-behavior` utility enables smooth animations for discrete properties like `display` and `visibility`, and the `starting` variant exposes CSS `@starting-style` for enter/exit effects.

---

## Transitions

### Transition Property

Controls which CSS properties animate when they change. All transition utilities include a default duration of `150ms` and `ease-in-out` timing.

| Class | What transitions |
|-------|-----------------|
| `transition` | color, bg, border, opacity, shadow, transform, display, and more |
| `transition-all` | all properties |
| `transition-colors` | color, background-color, border-color, fill, stroke, and related |
| `transition-opacity` | opacity |
| `transition-shadow` | box-shadow |
| `transition-transform` | transform, translate, scale, rotate |
| `transition-none` | nothing (disables all transitions) |

```html
<button class="bg-blue-500 transition hover:bg-indigo-500">Save</button>
<button class="transition-colors duration-300 hover:bg-sky-700 hover:text-white">Colors only</button>
```

Arbitrary and custom property syntax:

```html
<div class="transition-[height,opacity]">...</div>
<div class="transition-(--my-props)">...</div>
```

### Transition Duration

```html
<button class="transition duration-150">Fast (150ms)</button>
<button class="transition duration-300">Medium (300ms)</button>
<button class="transition duration-700">Slow (700ms)</button>

<!-- Any integer value in ms -->
<button class="transition duration-500">500ms</button>

<!-- Arbitrary -->
<button class="transition duration-[1s,15s]">Staggered</button>
```

### Transition Timing Function

| Class | Easing |
|-------|--------|
| `ease-linear` | `linear` |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

Custom easing via `@theme`:

```css
@theme {
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  --ease-in-expo: cubic-bezier(0.95, 0.05, 0.795, 0.035);
}
```

```html
<button class="transition ease-fluid duration-500">Fluid</button>
<button class="ease-[cubic-bezier(0.95,0.05,0.795,0.035)] duration-300">Custom</button>
```

### Transition Behavior (New in v4)

`transition-behavior` enables smooth transitions on **discrete** properties like `display` and `visibility`. Without it, toggling `display: none` is always instantaneous.

| Class | CSS |
|-------|-----|
| `transition-discrete` | `transition-behavior: allow-discrete;` |
| `transition-normal` | `transition-behavior: normal;` |

```html
<!-- Without transition-discrete: abrupt disappearance -->
<button class="hidden transition-all not-peer-has-checked:opacity-0 peer-has-checked:block">
  Disappears instantly
</button>

<!-- With transition-discrete: fades out before hiding -->
<button class="hidden transition-all transition-discrete not-peer-has-checked:opacity-0 peer-has-checked:block">
  Fades out smoothly
</button>
```

### Transition Delay

```html
<button class="transition duration-300 delay-150">Delayed start</button>
<button class="transition duration-300 delay-[400ms]">Custom delay</button>
```

### Practical Transition Example

```html
<button class="bg-sky-500 text-white px-4 py-2 rounded
               transition duration-300 ease-in-out
               hover:bg-sky-700 hover:scale-105
               motion-reduce:transition-none">
  Hover me
</button>
```

---

## Animations

### Built-in Animations

| Class | Effect | Common Use |
|-------|--------|------------|
| `animate-spin` | Continuous 360° rotation (1s linear) | Loading spinners |
| `animate-ping` | Scale-and-fade pulse (1s) | Notification badges |
| `animate-pulse` | Fade in/out (2s) | Skeleton loaders |
| `animate-bounce` | Bounce up/down (1s) | Scroll indicators |
| `animate-none` | Removes all animations | Reset |

#### Spin — Loading Spinner

```html
<button disabled>
  <svg class="mr-2 size-5 animate-spin" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
  Processing…
</button>
```

#### Ping — Notification Badge

```html
<span class="relative flex size-3">
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
  <span class="relative inline-flex size-3 rounded-full bg-sky-500"></span>
</span>
```

#### Pulse — Skeleton Loader

```html
<div class="flex animate-pulse space-x-4">
  <div class="size-10 rounded-full bg-gray-200"></div>
  <div class="flex-1 space-y-6 py-1">
    <div class="h-2 rounded bg-gray-200"></div>
    <div class="h-2 w-5/6 rounded bg-gray-200"></div>
  </div>
</div>
```

#### Bounce — Scroll Indicator

```html
<svg class="size-6 animate-bounce text-gray-500" viewBox="0 0 24 24">
  <path d="M19 9l-7 7-7-7"/>
</svg>
```

### Custom Animations

Define custom animations with `@theme` so they integrate with Tailwind's utility system:

```css
@theme {
  --animate-wiggle: wiggle 1s ease-in-out infinite;
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.4s ease-out;

  @keyframes wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(1rem); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
}
```

```html
<div class="animate-wiggle">Wiggly text</div>
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-up">Slides up</div>
```

### Arbitrary Animation Values

```html
<div class="animate-[wiggle_1s_ease-in-out_infinite]">Arbitrary</div>
<div class="animate-(--my-animation)">From CSS variable</div>
```

### Respecting Reduced Motion

Use `motion-safe:` and `motion-reduce:` variants for accessibility:

```html
<!-- Only animate if user has NOT requested reduced motion -->
<svg class="motion-safe:animate-spin">...</svg>

<!-- Disable transition for users who want reduced motion -->
<button class="transition duration-300 motion-reduce:transition-none">...</button>
<button class="transition duration-300 motion-reduce:duration-0">...</button>
```

---

## 2D Transforms

### Rotate

```html
<!-- Degrees -->
<img class="rotate-45" />
<img class="rotate-90" />
<img class="rotate-180" />
<img class="-rotate-45" />

<!-- Arbitrary -->
<img class="rotate-[3.142rad]" />
<img class="rotate-(--my-rotation)" />
```

### Scale

```html
<img class="scale-50" />     <!-- 50% -->
<img class="scale-100" />    <!-- 100% (default) -->
<img class="scale-150" />    <!-- 150% -->
<img class="scale-x-75" />   <!-- horizontal only -->
<img class="scale-y-125" />  <!-- vertical only -->
<img class="-scale-x-100" /> <!-- flip horizontal -->
```

### Skew

```html
<img class="skew-x-6" />
<img class="skew-y-12" />
<img class="-skew-x-6" />
```

### Translate

```html
<!-- Using spacing scale -->
<img class="translate-x-4" />
<img class="translate-y-8" />
<img class="-translate-y-4" />

<!-- Percentage -->
<img class="translate-x-1/2" />
<img class="-translate-x-full" />
```

### Transform Origin

```html
<img class="origin-center" />
<img class="origin-top" />
<img class="origin-top-right" />
<img class="origin-bottom-left" />
<img class="origin-[33%_75%]" />
```

---

## 3D Transforms (New in v4)

Tailwind v4 adds first-class 3D transform utilities using individual CSS transform properties.

### Perspective

Controls the depth of the 3D viewing space (set on the **parent** element):

| Class | CSS |
|-------|-----|
| `perspective-dramatic` | `perspective: 100px` |
| `perspective-near` | `perspective: 300px` |
| `perspective-normal` | `perspective: 500px` |
| `perspective-midrange` | `perspective: 800px` |
| `perspective-distant` | `perspective: 1200px` |
| `perspective-none` | `perspective: none` |

```html
<div class="perspective-normal">
  <img class="rotate-x-45" />
</div>
```

Custom perspective values:

```css
@theme {
  --perspective-remote: 1800px;
}
```

```html
<div class="perspective-remote">...</div>
<div class="perspective-[600px]">...</div>
```

### 3D Rotate

```html
<img class="rotate-x-45" />     <!-- rotateX(45deg) -->
<img class="-rotate-x-15" />    <!-- rotateX(-15deg) -->
<img class="rotate-y-30" />     <!-- rotateY(30deg) -->
<img class="-rotate-y-30" />    <!-- rotateY(-30deg) -->
<img class="rotate-z-45" />     <!-- rotateZ(45deg) -->

<!-- Combine with 2D -->
<img class="rotate-x-50 rotate-z-45" />
```

### 3D Translate

```html
<div class="translate-z-12">...</div>
<div class="-translate-z-12">...</div>
```

### transform-style

Controls how children are rendered in 3D:

```html
<!-- Enable 3D space for children -->
<div class="transform-3d perspective-normal">
  <img class="rotate-y-45" />
</div>

<!-- Flatten to 2D (default behavior) -->
<div class="transform-flat">...</div>
```

### backface-visibility

Controls whether the back of a 3D-rotated element is visible:

```html
<img class="backface-visible rotate-y-180" />   <!-- back is visible -->
<img class="backface-hidden rotate-y-180" />    <!-- back is invisible -->
```

### Practical 3D Example — Card Flip

```html
<div class="perspective-normal group relative h-48 w-32">
  <!-- Front -->
  <div class="absolute inset-0 backface-hidden transition duration-500 transform-3d
              group-hover:rotate-y-180 bg-blue-500 rounded-xl">
    Front
  </div>
  <!-- Back -->
  <div class="absolute inset-0 backface-hidden rotate-y-180 transition duration-500 transform-3d
              group-hover:rotate-y-0 bg-red-500 rounded-xl">
    Back
  </div>
</div>
```

---

## Enter/Exit Animations with @starting-style

The `starting` variant exposes CSS `@starting-style`, enabling enter animations for elements transitioning from `display: none`.

```html
<!-- Fade in on appear -->
<dialog class="opacity-0 transition duration-300
               starting:opacity-0 open:opacity-100">
  <!-- opacity-0 is the @starting-style (before the element is shown) -->
  <!-- open:opacity-100 is the shown state -->
</dialog>
```

This works with `transition-discrete` for elements that toggle `display`:

```html
<div class="hidden opacity-0 transition-all transition-discrete duration-300
            peer-checked:block peer-checked:opacity-100
            starting:peer-checked:opacity-0">
  Fades in when shown, fades out when hidden
</div>
```

---

## Responsive & Conditional Animations

All animation and transform utilities support all variants:

```html
<!-- Responsive -->
<div class="animate-none md:animate-spin">...</div>
<div class="rotate-0 hover:rotate-180 transition duration-300">...</div>

<!-- State-based -->
<button class="scale-100 hover:scale-105 active:scale-95 transition">
  Click me
</button>

<!-- Dark mode -->
<div class="animate-pulse dark:animate-none">...</div>
```

---

## Quick Reference — All Transform Utilities

| Category | Examples |
|----------|---------|
| Rotate 2D | `rotate-45`, `-rotate-90`, `rotate-[3.142rad]` |
| Rotate 3D | `rotate-x-45`, `rotate-y-30`, `rotate-z-15` |
| Scale | `scale-50`, `scale-x-75`, `-scale-x-100` |
| Skew | `skew-x-6`, `skew-y-12` |
| Translate 2D | `translate-x-4`, `-translate-y-full` |
| Translate 3D | `translate-z-12`, `-translate-z-8` |
| Transform Origin | `origin-center`, `origin-top-left` |
| Perspective | `perspective-near`, `perspective-normal`, `perspective-[600px]` |
| 3D Space | `transform-3d`, `transform-flat` |
| Backface | `backface-hidden`, `backface-visible` |
