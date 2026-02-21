---
title: "Tailwind CSS v4 — Typography & Visual Effects"
source:
  - url: "https://tailwindcss.com/docs/font-family"
    title: "Font Family — Typography — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/font-size"
    title: "Font Size — Typography — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/text-color"
    title: "Text Color — Typography — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/background-color"
    title: "Background Color — Backgrounds — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/background-image"
    title: "Background Image — Backgrounds — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/border-radius"
    title: "Border Radius — Borders — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/box-shadow"
    title: "Box Shadow — Effects — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/blur"
    title: "Blur — Filters — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/mask-image"
    title: "Mask Image — Effects — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/mask-composite"
    title: "Mask Composite — Effects — Tailwind CSS"
  - url: "https://tailwindcss.com/docs/mask-clip"
    title: "Mask Clip — Effects — Tailwind CSS"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [tailwindcss, tailwindcss-v4, typography, colors, gradients, shadows, filters, masks, borders]
---

# Tailwind CSS v4 — Typography & Visual Effects

## Overview

Tailwind CSS v4 provides an extensive set of utility classes for typography, colors, gradients, borders, shadows, filters, and masks. v4 introduces several new visual utilities — including `text-shadow`, `inset-shadow-*`, `inset-ring-*`, angle-based gradients (`bg-linear-45`), radial and conic gradients, gradient interpolation modes, and mask utilities — while continuing to use the OKLCH color space and CSS custom properties throughout.

---

## Typography

### Font Family

| Class | Description |
|-------|-------------|
| `font-sans` | Default sans-serif stack |
| `font-serif` | Serif font stack |
| `font-mono` | Monospace font stack |
| `font-[<value>]` | Arbitrary custom value |
| `font-(family-name:<var>)` | Reference a CSS custom property |

**Defining custom fonts in `@theme`:**

```css
@theme {
  --font-display: "Oswald", sans-serif;
  --font-display--font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  --font-display--font-variation-settings: "opsz" 32;
}
```

### Font Size

Utilities set `font-size` (and optionally a paired `line-height`).

| Class | Approx. size |
|-------|-------------|
| `text-xs` | 0.75rem |
| `text-sm` | 0.875rem |
| `text-base` | 1rem |
| `text-lg` | 1.125rem |
| `text-xl` | 1.25rem |
| `text-2xl` | 1.5rem |
| `text-3xl` | 1.875rem |
| `text-4xl` | 2.25rem |
| `text-5xl` | 3rem |
| `text-6xl` | 3.75rem |
| `text-7xl` | 4.5rem |
| `text-8xl` | 6rem |
| `text-9xl` | 8rem |

**Set font size + line-height together using `/`:**

```html
<p class="text-sm/6">Small text, line-height 1.5rem</p>
<p class="text-xl/8">XL text, line-height 2rem</p>
```

**Arbitrary values:**

```html
<p class="text-[14px]">14px text</p>
<p class="text-(length:--my-size)">From CSS variable</p>
```

### Font Weight

| Class | Weight |
|-------|--------|
| `font-thin` | 100 |
| `font-extralight` | 200 |
| `font-light` | 300 |
| `font-normal` | 400 |
| `font-medium` | 500 |
| `font-semibold` | 600 |
| `font-bold` | 700 |
| `font-extrabold` | 800 |
| `font-black` | 900 |

### Font Stretch (v4)

Control variable font width axes with `font-stretch-*` utilities (new in v4):

```html
<p class="font-stretch-condensed">Condensed text</p>
<p class="font-stretch-expanded">Expanded text</p>
<p class="font-stretch-[125%]">Custom stretch</p>
```

### Text Decoration

```html
<p class="underline">Underlined</p>
<p class="overline">Overline</p>
<p class="line-through">Strikethrough</p>
<p class="no-underline">Remove decoration</p>

<!-- Decoration color -->
<p class="underline decoration-blue-500">Blue underline</p>

<!-- Decoration style -->
<p class="underline decoration-dashed">Dashed underline</p>
<p class="underline decoration-wavy decoration-red-500">Wavy red underline</p>

<!-- Decoration thickness -->
<p class="underline decoration-2">2px thick</p>
<p class="underline decoration-4">4px thick</p>

<!-- Underline offset -->
<p class="underline underline-offset-4">Offset 4px</p>
```

### Text Transform & Wrap

```html
<p class="uppercase">UPPERCASE</p>
<p class="lowercase">lowercase</p>
<p class="capitalize">Capitalize Each Word</p>
<p class="normal-case">Normal case</p>

<!-- Text wrap (v4 includes text-wrap: balance support) -->
<p class="text-balance">Balanced text wrap across lines</p>
<p class="text-pretty">Pretty wrapping — no orphan words</p>
<p class="text-nowrap">No wrap</p>
```

### Line Clamp

Truncate multi-line text with an ellipsis:

```html
<p class="line-clamp-2">Truncated to 2 lines...</p>
<p class="line-clamp-3">Truncated to 3 lines...</p>
<p class="line-clamp-none">No line clamping</p>
```

### Letter Spacing & Line Height

```html
<!-- Letter spacing (tracking) -->
<p class="tracking-tighter">Tighter tracking</p>
<p class="tracking-tight">Tight tracking</p>
<p class="tracking-normal">Normal</p>
<p class="tracking-wide">Wide tracking</p>
<p class="tracking-wider">Wider tracking</p>
<p class="tracking-widest">Widest tracking</p>

<!-- Line height (leading) -->
<p class="leading-none">line-height: 1</p>
<p class="leading-tight">line-height: 1.25</p>
<p class="leading-normal">line-height: 1.5</p>
<p class="leading-loose">line-height: 2</p>
```

---

## Colors

### Text Color

```html
<p class="text-blue-600">Blue text</p>
<p class="text-red-500">Red text</p>
<p class="text-transparent">Transparent</p>
<p class="text-inherit">Inherit parent</p>
<p class="text-current">currentColor</p>
```

**Opacity modifier (v4 `/` syntax):**

```html
<p class="text-blue-600/75">75% opacity blue</p>
<p class="text-blue-600/50">50% opacity blue</p>
```

**Arbitrary values:**

```html
<p class="text-[#50d71e]">Custom hex</p>
<p class="text-(--my-color)">From CSS variable</p>
```

### OKLCH Color Space

All v4 colors use the OKLCH color space for perceptual uniformity:

```css
/* Example: text-red-500 resolves to: */
color: oklch(63.7% 0.237 25.331);
```

### Background Color

```html
<div class="bg-sky-500">Sky background</div>
<div class="bg-sky-500/75">75% opacity</div>
<div class="bg-[#50d71e]">Custom hex</div>
<div class="bg-(--my-color)">From CSS variable</div>
```

**State variants:**

```html
<button class="bg-sky-500 hover:bg-sky-600">Hover darkens</button>
<div class="bg-white dark:bg-gray-900">Dark mode aware</div>
```

---

## Gradients (New & Enhanced in v4)

### Linear Gradients

**Directional (unchanged from v3):**

```html
<div class="bg-linear-to-r from-indigo-500 to-purple-600">Left to right</div>
<div class="bg-linear-to-br from-cyan-500 to-blue-700">Diagonal</div>
```

**Angle-based gradients (new in v4):**

```html
<div class="bg-linear-45 from-purple-500 to-pink-500">45° angle</div>
<div class="bg-linear-90 from-green-400 to-teal-500">90° (top to bottom)</div>
<div class="bg-linear-[25deg,red_5%,yellow_60%,lime_90%]">Arbitrary</div>
```

**Multiple color stops with positioning:**

```html
<div class="bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
  Three-stop gradient
</div>
```

### Radial Gradients (new in v4)

```html
<div class="size-24 rounded-full bg-radial from-pink-400 from-40% to-fuchsia-700">
  Default radial
</div>

<!-- Custom focal point -->
<div class="bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90%">
  Off-center radial
</div>
```

### Conic Gradients (new in v4)

```html
<div class="size-24 rounded-full bg-conic from-blue-600 to-sky-400 to-50%">
  Default conic
</div>

<div class="size-24 rounded-full bg-conic-180 from-indigo-600 via-indigo-50 to-indigo-600">
  Starting at 180°
</div>
```

### Gradient Interpolation Modes (new in v4)

Control the color space used for gradient interpolation with a `/` modifier:

```html
<!-- Default is oklab -->
<div class="bg-linear-to-r from-indigo-500 to-teal-400">oklab (default)</div>
<div class="bg-linear-to-r/srgb from-indigo-500 to-teal-400">sRGB</div>
<div class="bg-linear-to-r/hsl from-indigo-500 to-teal-400">HSL</div>
<div class="bg-linear-to-r/oklch from-indigo-500 to-teal-400">OKLCH</div>
<div class="bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700">Decreasing hue</div>
```

Available interpolation modes: `srgb`, `hsl`, `oklab` (default), `oklch`, `longer`, `shorter`, `increasing`, `decreasing`.

---

## Borders

### Border Radius

```html
<div class="rounded-sm">4px</div>
<div class="rounded-md">6px</div>
<div class="rounded-lg">8px</div>
<div class="rounded-xl">12px</div>
<div class="rounded-2xl">16px</div>
<div class="rounded-full">9999px (pill/circle)</div>
<div class="rounded-none">0</div>

<!-- Side-specific -->
<div class="rounded-t-lg">Top corners only</div>
<div class="rounded-b-xl">Bottom corners only</div>
<div class="rounded-l-md">Left corners only</div>

<!-- Individual corners -->
<div class="rounded-tl-lg rounded-br-lg">Diagonal corners</div>

<!-- Logical properties (RTL-aware) -->
<div class="rounded-s-lg">Start side (left in LTR)</div>
<div class="rounded-e-lg">End side (right in LTR)</div>

<!-- Arbitrary -->
<div class="rounded-[2vw]">Viewport-relative</div>
```

**Custom in `@theme`:**

```css
@theme {
  --radius-5xl: 3rem;
}
```

### Border Width & Color

```html
<div class="border">1px border</div>
<div class="border-2">2px border</div>
<div class="border-4">4px border</div>
<div class="border-t-2">Top 2px only</div>

<div class="border border-gray-300">Gray border</div>
<div class="border-2 border-blue-500">Blue 2px border</div>
<div class="border border-blue-500/50">50% opacity border</div>
```

### Outline

```html
<button class="outline outline-2 outline-blue-500">Outlined button</button>
<button class="outline-dashed outline-2 outline-offset-2">Dashed outline with offset</button>
<button class="outline-none focus:outline-2 focus:outline-blue-500">Focus outline</button>
```

### Divide Utilities

Add borders between child elements:

```html
<div class="divide-y divide-gray-200">
  <div>Row 1</div>
  <div>Row 2</div>
  <div>Row 3</div>
</div>
```

---

## Shadows & Effects

### Box Shadow

```html
<div class="shadow-2xs">Barely visible shadow</div>
<div class="shadow-xs">Extra small shadow</div>
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-2xl">2XL shadow</div>
<div class="shadow-none">No shadow</div>
```

**Colored shadows:**

```html
<div class="shadow-lg shadow-blue-500/50">Blue shadow</div>
<div class="shadow-xl shadow-red-500">Red shadow</div>
```

**Arbitrary:**

```html
<div class="shadow-[0_8px_16px_rgba(0,0,0,0.2)]">Custom shadow</div>
```

### Text Shadow (new in v4)

```html
<h1 class="text-shadow-sm">Small text shadow</h1>
<h1 class="text-shadow">Default text shadow</h1>
<h1 class="text-shadow-lg">Large text shadow</h1>
<h1 class="text-shadow-none">No text shadow</h1>
```

### Inset Shadow (new in v4)

```html
<div class="inset-shadow-2xs">2xs inset shadow</div>
<div class="inset-shadow-xs">xs inset shadow</div>
<div class="inset-shadow-sm">sm inset shadow</div>

<!-- Colored inset shadow -->
<div class="inset-shadow-sm inset-shadow-blue-200">Blue inset shadow</div>

<!-- Arbitrary -->
<div class="inset-shadow-[inset_0_2px_4px_rgb(0_0_0/_0.1)]">Custom</div>
```

### Ring

```html
<button class="ring">1px ring</button>
<button class="ring-2">2px ring</button>
<button class="ring-4">4px ring</button>
<button class="ring-2 ring-blue-500">Colored ring</button>
<button class="ring-2 ring-offset-2">Ring with offset</button>
```

### Inset Ring (new in v4)

Ring that appears _inside_ the element boundary:

```html
<input class="inset-ring-2 inset-ring-blue-500 focus:inset-ring-4">
<button class="inset-ring inset-ring-green-600">Green inset ring</button>
```

### Opacity

```html
<div class="opacity-0">Invisible</div>
<div class="opacity-25">25%</div>
<div class="opacity-50">50%</div>
<div class="opacity-75">75%</div>
<div class="opacity-100">Fully opaque</div>
```

### Blend Modes

```html
<!-- mix-blend-mode -->
<div class="mix-blend-multiply">Multiply blend</div>
<div class="mix-blend-screen">Screen blend</div>
<div class="mix-blend-overlay">Overlay blend</div>
<div class="mix-blend-darken">Darken blend</div>
<div class="mix-blend-lighten">Lighten blend</div>
<div class="mix-blend-color-dodge">Color dodge</div>
<div class="mix-blend-difference">Difference</div>

<!-- background-blend-mode -->
<div class="bg-blend-multiply">Blend background layers</div>
<div class="bg-blend-screen">Screen bg layers</div>
```

---

## Filters

### Element Filters

```html
<!-- Blur -->
<img class="blur-xs" src="...">   <!-- blur(4px) -->
<img class="blur-sm" src="...">   <!-- blur(8px) -->
<img class="blur-md" src="...">   <!-- blur(12px) -->
<img class="blur-lg" src="...">   <!-- blur(16px) -->
<img class="blur-xl" src="...">   <!-- blur(24px) -->
<img class="blur-2xl" src="...">  <!-- blur(40px) -->
<img class="blur-3xl" src="...">  <!-- blur(64px) -->
<img class="blur-none" src="..."> <!-- no blur -->
<img class="blur-[2px]" src="..."> <!-- arbitrary -->

<!-- Brightness -->
<img class="brightness-50">   <!-- darken -->
<img class="brightness-100">  <!-- normal -->
<img class="brightness-150">  <!-- brighten -->

<!-- Contrast -->
<img class="contrast-50">   <!-- low contrast -->
<img class="contrast-100">  <!-- normal -->
<img class="contrast-200">  <!-- high contrast -->

<!-- Grayscale -->
<img class="grayscale">     <!-- full grayscale -->
<img class="grayscale-0">   <!-- no grayscale -->
<img class="grayscale-50">  <!-- 50% grayscale -->

<!-- Hue rotate -->
<img class="hue-rotate-15">   <!-- 15° -->
<img class="hue-rotate-90">   <!-- 90° -->
<img class="hue-rotate-180">  <!-- 180° -->
<img class="-hue-rotate-90">  <!-- -90° -->

<!-- Invert -->
<img class="invert">    <!-- fully inverted -->
<img class="invert-0">  <!-- no inversion -->

<!-- Saturate -->
<img class="saturate-50">   <!-- desaturate -->
<img class="saturate-100">  <!-- normal -->
<img class="saturate-200">  <!-- boost -->

<!-- Sepia -->
<img class="sepia">     <!-- full sepia -->
<img class="sepia-0">   <!-- no sepia -->

<!-- Drop shadow (uses filter, not box-shadow) -->
<img class="drop-shadow-sm">
<img class="drop-shadow-md">
<img class="drop-shadow-lg">
<img class="drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]">

<!-- Remove all filters -->
<img class="filter-none">
```

**Custom blur values in `@theme`:**

```css
@theme {
  --blur-2xs: 2px;
}
```

### Backdrop Filters

Apply filters to the area _behind_ an element (e.g., frosted glass effect):

```html
<!-- Backdrop blur -->
<div class="backdrop-blur-sm">Frosted glass effect</div>
<div class="backdrop-blur-lg">Heavy frosted glass</div>
<div class="backdrop-blur-none">No backdrop blur</div>

<!-- Backdrop brightness -->
<div class="backdrop-brightness-50">Darken backdrop</div>
<div class="backdrop-brightness-150">Brighten backdrop</div>

<!-- Backdrop contrast -->
<div class="backdrop-contrast-50">Low contrast backdrop</div>
<div class="backdrop-contrast-200">High contrast backdrop</div>

<!-- Backdrop grayscale -->
<div class="backdrop-grayscale">Grayscale backdrop</div>
<div class="backdrop-grayscale-0">Normal backdrop</div>

<!-- Backdrop opacity -->
<div class="backdrop-opacity-10">10% backdrop opacity</div>
<div class="backdrop-opacity-60">60% backdrop opacity</div>

<!-- Backdrop saturate -->
<div class="backdrop-saturate-50">Desaturated backdrop</div>
<div class="backdrop-saturate-200">Oversaturated backdrop</div>

<!-- Remove all backdrop filters -->
<div class="backdrop-filter-none">No backdrop filters</div>
```

**Frosted glass example:**

```html
<div class="relative">
  <img class="absolute inset-0 w-full h-full object-cover" src="background.jpg">
  <div class="relative backdrop-blur-sm bg-white/30 rounded-xl p-6">
    <h2 class="text-white font-bold text-shadow">Frosted card</h2>
  </div>
</div>
```

---

## Masks (new in v4.1)

Mask utilities let you control the visible area of an element using gradients or images.

### mask-image

Fade elements using gradient masks:

```html
<!-- Fade from top -->
<div class="mask-t-from-50%">Fades in from the top at 50%</div>

<!-- Fade to bottom -->
<div class="mask-b-to-80%">Fades out at the bottom at 80%</div>

<!-- Radial mask -->
<div class="mask-radial-from-black mask-radial-to-transparent">
  Visible in center, fades at edges
</div>
```

### mask-clip

Control the bounding box used for the mask:

```html
<div class="mask-clip-border">Mask extends to border box</div>
<div class="mask-clip-padding">Mask extends to padding box</div>
<div class="mask-clip-content">Mask extends to content box</div>
```

### mask-composite

Control how multiple masks combine:

```html
<div class="mask-add">Add masks together</div>
<div class="mask-subtract">Subtract second mask from first</div>
<div class="mask-intersect">Show only overlapping areas</div>
<div class="mask-exclude">Exclude overlapping areas</div>
```

---

## New v4 Visual Utilities — Summary

| Utility | Description |
|---------|-------------|
| `text-shadow-*` | Text shadow support (was plugin-only in v3) |
| `inset-shadow-*` | Inset box shadow utilities |
| `inset-ring-*` | Ring inside element boundary |
| `bg-linear-<angle>` | Gradient by degree (e.g., `bg-linear-45`) |
| `bg-radial-*` | Radial gradient utilities |
| `bg-conic-*` | Conic gradient utilities |
| `bg-linear-to-r/oklch` | Gradient interpolation mode modifier |
| `font-stretch-*` | Variable font width axis control |
| `text-balance` | `text-wrap: balance` for balanced headings |
| `text-pretty` | `text-wrap: pretty` to prevent orphan words |
| `mask-*` | Mask image, clip, and composite utilities (v4.1) |
