---
title: "shadcn/ui Components Catalog"
source:
  - url: "https://ui.shadcn.com/docs"
    title: "shadcn/ui Introduction"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn-ui, components, catalog, radix-ui, react]
---

# shadcn/ui Components Catalog

## Overview

shadcn/ui offers 80+ components organized around a philosophy of open code and composition. Components are copied directly into your project (not installed as a package), giving you full ownership and customization control. Many components are built on [Radix UI](https://www.radix-ui.com/) primitives for accessible, headless behavior.

## Component Philosophy

- **Open Code**: Component source lives in your codebase — modify freely without wrapper hacks
- **Composition**: All components share a common, composable interface
- **Radix UI Primitives**: Many interactive components delegate behavior to Radix UI for accessibility
- **AI-Ready**: Open code makes components readable and improvable by language models

> Components are added via CLI: `npx shadcn@latest add <component-name>`

---

## Form & Input

Components for building user input forms and interactive controls.

| Component | Description | Radix UI | Docs |
|-----------|-------------|----------|------|
| Button | Trigger actions; supports multiple variants and sizes | No | [/docs/components/button](https://ui.shadcn.com/docs/components/button) |
| Button Group | Group related buttons with shared styling | No | [/docs/components/button-group](https://ui.shadcn.com/docs/components/button-group) |
| Checkbox | Binary on/off toggle with label support | Yes (Checkbox) | [/docs/components/checkbox](https://ui.shadcn.com/docs/components/checkbox) |
| Calendar | Date selection widget; typically composed with Date Picker | No (react-day-picker) | [/docs/components/calendar](https://ui.shadcn.com/docs/components/calendar) |
| Combobox | Searchable select built on Command + Popover | Yes (via Command) | [/docs/components/combobox](https://ui.shadcn.com/docs/components/combobox) |
| Date Picker | Calendar in a Popover for inline date input | Yes (via Popover) | [/docs/components/date-picker](https://ui.shadcn.com/docs/components/date-picker) |
| Field | Form field wrapper providing layout and label association | No | [/docs/components/field](https://ui.shadcn.com/docs/components/field) |
| Form | Form primitives using React Hook Form; wraps Field, Label, errors | No (react-hook-form) | [/docs/components/form](https://ui.shadcn.com/docs/components/form) |
| Input | Single-line text input with Tailwind styling | No | [/docs/components/input](https://ui.shadcn.com/docs/components/input) |
| Input Group | Combine Input with prefix/suffix addons | No | [/docs/components/input-group](https://ui.shadcn.com/docs/components/input-group) |
| Input OTP | One-time password input with segmented slots | No (input-otp) | [/docs/components/input-otp](https://ui.shadcn.com/docs/components/input-otp) |
| Label | Accessible form label linked to a control | Yes (Label) | [/docs/components/label](https://ui.shadcn.com/docs/components/label) |
| Radio Group | Mutually exclusive option selection | Yes (Radio Group) | [/docs/components/radio-group](https://ui.shadcn.com/docs/components/radio-group) |
| Select | Dropdown selection with trigger and content | Yes (Select) | [/docs/components/select](https://ui.shadcn.com/docs/components/select) |
| Slider | Range/value slider with drag interaction | Yes (Slider) | [/docs/components/slider](https://ui.shadcn.com/docs/components/slider) |
| Switch | Toggle switch for boolean settings | Yes (Switch) | [/docs/components/switch](https://ui.shadcn.com/docs/components/switch) |
| Textarea | Multi-line text input | No | [/docs/components/textarea](https://ui.shadcn.com/docs/components/textarea) |

### Common Form Pattern

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"

const form = useForm({ defaultValues: { email: "" } })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="you@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

---

## Layout & Navigation

Components for structuring pages and enabling navigation.

| Component | Description | Radix UI | Docs |
|-----------|-------------|----------|------|
| Accordion | Expandable/collapsible sections | Yes (Accordion) | [/docs/components/accordion](https://ui.shadcn.com/docs/components/accordion) |
| Breadcrumb | Hierarchical navigation trail | No | [/docs/components/breadcrumb](https://ui.shadcn.com/docs/components/breadcrumb) |
| Navigation Menu | Accessible top-level site navigation with dropdowns | Yes (Navigation Menu) | [/docs/components/navigation-menu](https://ui.shadcn.com/docs/components/navigation-menu) |
| Resizable | Resizable panel groups (split panes) | No (react-resizable-panels) | [/docs/components/resizable](https://ui.shadcn.com/docs/components/resizable) |
| Scroll Area | Custom-styled scrollable container | Yes (Scroll Area) | [/docs/components/scroll-area](https://ui.shadcn.com/docs/components/scroll-area) |
| Separator | Visual divider between content sections | Yes (Separator) | [/docs/components/separator](https://ui.shadcn.com/docs/components/separator) |
| Sidebar | Collapsible sidebar with nav links | No | [/docs/components/sidebar](https://ui.shadcn.com/docs/components/sidebar) |
| Tabs | Tabbed panel switching | Yes (Tabs) | [/docs/components/tabs](https://ui.shadcn.com/docs/components/tabs) |

---

## Overlays & Dialogs

Components that layer over content — modals, menus, tooltips.

| Component | Description | Radix UI | Docs |
|-----------|-------------|----------|------|
| Alert Dialog | Blocking confirmation dialog requiring a user decision | Yes (Alert Dialog) | [/docs/components/alert-dialog](https://ui.shadcn.com/docs/components/alert-dialog) |
| Command | Searchable command palette | Yes (via Dialog) | [/docs/components/command](https://ui.shadcn.com/docs/components/command) |
| Context Menu | Right-click contextual menu | Yes (Context Menu) | [/docs/components/context-menu](https://ui.shadcn.com/docs/components/context-menu) |
| Dialog | Modal overlay for important content or actions | Yes (Dialog) | [/docs/components/dialog](https://ui.shadcn.com/docs/components/dialog) |
| Drawer | Slide-in panel from screen edge | No (vaul) | [/docs/components/drawer](https://ui.shadcn.com/docs/components/drawer) |
| Dropdown Menu | Contextual action menu triggered by a button | Yes (Dropdown Menu) | [/docs/components/dropdown-menu](https://ui.shadcn.com/docs/components/dropdown-menu) |
| Hover Card | Rich tooltip shown on hover | Yes (Hover Card) | [/docs/components/hover-card](https://ui.shadcn.com/docs/components/hover-card) |
| Menubar | Horizontal application-style menu bar | Yes (Menubar) | [/docs/components/menubar](https://ui.shadcn.com/docs/components/menubar) |
| Popover | Floating panel anchored to a trigger | Yes (Popover) | [/docs/components/popover](https://ui.shadcn.com/docs/components/popover) |
| Sheet | Side panel / off-canvas overlay | Yes (Dialog) | [/docs/components/sheet](https://ui.shadcn.com/docs/components/sheet) |
| Tooltip | Brief explanatory label on hover | Yes (Tooltip) | [/docs/components/tooltip](https://ui.shadcn.com/docs/components/tooltip) |

### Dialog vs Sheet vs Drawer

- **Dialog** — Centered modal; use for critical actions (confirm, form)
- **Sheet** — Full-height side panel; use for settings, detail views
- **Drawer** — Slides from bottom edge; mobile-friendly alternative to Sheet
- **Alert Dialog** — Blocking version of Dialog; user *must* respond (no outside-click dismiss)

---

## Feedback & Status

Components that communicate state, loading, or results to the user.

| Component | Description | Radix UI | Docs |
|-----------|-------------|----------|------|
| Alert | Inline status message (info, success, warning, error) | No | [/docs/components/alert](https://ui.shadcn.com/docs/components/alert) |
| Badge | Small label for status or category tagging | No | [/docs/components/badge](https://ui.shadcn.com/docs/components/badge) |
| Empty | Placeholder state for empty lists or data | No | [/docs/components/empty](https://ui.shadcn.com/docs/components/empty) |
| Progress | Determinate progress bar | Yes (Progress) | [/docs/components/progress](https://ui.shadcn.com/docs/components/progress) |
| Skeleton | Placeholder shimmer while content loads | No | [/docs/components/skeleton](https://ui.shadcn.com/docs/components/skeleton) |
| Spinner | Indeterminate loading indicator | No | [/docs/components/spinner](https://ui.shadcn.com/docs/components/spinner) |
| Toast | Transient notification (shadcn uses Sonner) | No (sonner) | [/docs/components/toast](https://ui.shadcn.com/docs/components/toast) |

> **Note:** shadcn/ui v2+ recommends [Sonner](https://sonner.emilkowal.ski/) (`npx shadcn@latest add sonner`) as the Toast implementation.

---

## Display & Media

Components for presenting content, data, and media.

| Component | Description | Radix UI | Docs |
|-----------|-------------|----------|------|
| Aspect Ratio | Maintain a fixed width/height ratio for media | Yes (Aspect Ratio) | [/docs/components/aspect-ratio](https://ui.shadcn.com/docs/components/aspect-ratio) |
| Avatar | User profile image with fallback initials | Yes (Avatar) | [/docs/components/avatar](https://ui.shadcn.com/docs/components/avatar) |
| Card | Bordered content container with header/body/footer | No | [/docs/components/card](https://ui.shadcn.com/docs/components/card) |
| Carousel | Scroll through slides/items | No (embla-carousel) | [/docs/components/carousel](https://ui.shadcn.com/docs/components/carousel) |
| Chart | Data visualization built on Recharts | No (recharts) | [/docs/components/chart](https://ui.shadcn.com/docs/components/chart) |
| Data Table | Feature-rich table with sorting, filtering, pagination | No (tanstack/table) | [/docs/components/data-table](https://ui.shadcn.com/docs/components/data-table) |
| Item | Generic list or detail item layout | No | [/docs/components/item](https://ui.shadcn.com/docs/components/item) |
| Kbd | Keyboard key display element | No | [/docs/components/kbd](https://ui.shadcn.com/docs/components/kbd) |
| Table | HTML table with consistent styling | No | [/docs/components/table](https://ui.shadcn.com/docs/components/table) |
| Typography | Prose styling utilities (h1–h4, p, blockquote, etc.) | No | [/docs/components/typography](https://ui.shadcn.com/docs/components/typography) |

### Table vs Data Table

- **Table** — Styled HTML table primitive; use for simple static data
- **Data Table** — Built on TanStack Table; use for sortable, filterable, paginated data sets

---

## Miscellaneous

Utility components that don't fit neatly into other categories.

| Component | Description | Radix UI | Docs |
|-----------|-------------|----------|------|
| Collapsible | Toggle visibility of content sections | Yes (Collapsible) | [/docs/components/collapsible](https://ui.shadcn.com/docs/components/collapsible) |
| Pagination | Page navigation controls for list/table views | No | [/docs/components/pagination](https://ui.shadcn.com/docs/components/pagination) |
| Toggle | Stateful button that stays pressed/unpressed | Yes (Toggle) | [/docs/components/toggle](https://ui.shadcn.com/docs/components/toggle) |
| Toggle Group | Group of related Toggle buttons | Yes (Toggle Group) | [/docs/components/toggle-group](https://ui.shadcn.com/docs/components/toggle-group) |

---

## Adding Components

Use the shadcn CLI to add components:

```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add dialog form input label

# Add all components (use with caution)
npx shadcn@latest add --all
```

Components are written to the path configured in `components.json` (default: `src/components/ui/`).

## Composition Patterns

shadcn/ui components are designed for composition — smaller primitives combine into richer UI:

```tsx
// Combobox = Command + Popover
// Date Picker = Calendar + Popover
// Data Table = Table + TanStack Table hooks
// Form = react-hook-form + FormField + Input/Select/etc.

// Example: accessible Select with label
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="framework">Framework</Label>
  <Select>
    <SelectTrigger id="framework">
      <SelectValue placeholder="Select a framework" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="next">Next.js</SelectItem>
      <SelectItem value="remix">Remix</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## External Library Dependencies by Component

| Library | Components |
|---------|-----------|
| Radix UI | Accordion, Alert Dialog, Avatar, Checkbox, Collapsible, Command, Context Menu, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Slider, Switch, Tabs, Toggle, Toggle Group, Tooltip |
| react-hook-form | Form |
| react-day-picker | Calendar, Date Picker |
| @tanstack/react-table | Data Table |
| recharts | Chart |
| embla-carousel-react | Carousel |
| react-resizable-panels | Resizable |
| input-otp | Input OTP |
| vaul | Drawer |
| sonner | Toast |
