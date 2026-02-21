# @time-tracker/ui

Shared UI component library for the time-tracker app, built with [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Usage

Import components from the library in any app:

```tsx
import { Card, CardHeader, CardTitle, cn } from '@time-tracker/ui';
```

## Adding new shadcn components

The `components.json` at the project root is configured to write components directly into this library. Use the shadcn CLI:

```bash
npx shadcn add <component-name>
```

After adding, re-export the new component from `src/index.ts`.

## Components

- **Card** — `card.tsx`
- **Tabs** — `tabs.tsx`
- **ScrollArea** — `scroll-area.tsx`
- **Resizable** — `resizable.tsx`

## Related documentation

- [shadcn/ui overview](../../docs/research/shadcn-ui/_index.md)
- [shadcn setup in Nx monorepo](../../docs/research/shadcn-ui/setup-and-configuration.md)
- [Available components reference](../../docs/research/shadcn-ui/components-catalog.md)
- [Theme customization](../../docs/research/shadcn-ui/theming-and-styling.md)
- [Tailwind CSS v4 overview](../../docs/research/tailwindcss-v4/_index.md)
- [Tailwind v4 setup details](../../docs/research/tailwindcss-v4/setup.md)
- [Nx shared library patterns](../../docs/research/nx-electron/nx-typescript-libraries.md)
