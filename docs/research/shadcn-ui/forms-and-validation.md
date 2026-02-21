---
title: "shadcn/ui Forms and Validation"
source:
  - url: "https://ui.shadcn.com/docs/forms"
    title: "Forms Overview — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/forms/react-hook-form"
    title: "React Hook Form — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/forms/tanstack-form"
    title: "TanStack Form — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/components/form"
    title: "Form Component — shadcn/ui"
  - url: "https://ui.shadcn.com/docs/components/field"
    title: "Field Component — shadcn/ui"
created: 2026-02-21
updated: 2026-02-21
status: draft
tags: [shadcn-ui, forms, react-hook-form, tanstack-form, zod, validation, field]
---

# shadcn/ui Forms and Validation

## Overview

shadcn/ui takes a library-agnostic approach to forms: it provides accessible Field and Form UI components that compose with your choice of form state manager. The two officially supported libraries are **React Hook Form** and **TanStack Form**, both integrated with **Zod** for schema-based validation. A `React useActionState` path is noted as coming soon for server action workflows.

## Philosophy

Rather than bundling a form library, shadcn/ui ships composable UI primitives (Field, FieldLabel, FieldError, etc.) that work with whichever form manager you prefer. This keeps the component layer thin and the state management layer swappable.

Guides by approach:

| Approach | Guide |
|---|---|
| React Hook Form + Zod | https://ui.shadcn.com/docs/forms/react-hook-form |
| TanStack Form + Zod | https://ui.shadcn.com/docs/forms/tanstack-form |
| Next.js Server Actions | https://ui.shadcn.com/docs/forms/next |
| React useActionState | Coming soon |

## Field Component System

The `Field` component family provides the accessible building blocks for all form layouts. Import from `@/components/ui/field`.

### Subcomponents

| Component | Purpose |
|---|---|
| `Field` | Wrapper; controls orientation, spacing, and invalid state |
| `FieldLabel` | Styled `<label>` associated with the control |
| `FieldContent` | Flex column grouping control with description |
| `FieldDescription` | Helper text beneath the control |
| `FieldError` | Accessible error message; accepts `errors` array or Zod issues |
| `FieldGroup` | Stacks multiple `Field` components with container-query spacing |
| `FieldSet` | Semantic `<fieldset>` wrapper |
| `FieldLegend` | `<legend>` with `"legend"` or `"label"` variant |
| `FieldTitle` | Title rendered inside `FieldContent` |
| `FieldSeparator` | Visual divider between grouped sections |

### Key Props

- **`Field`**: `orientation` (`"vertical"` | `"horizontal"` | `"responsive"`), `data-invalid` (boolean)
- **`FieldError`**: `errors` — array of error strings or Standard Schema issues (Zod-compatible)

### Basic Field Structure

```tsx
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<Field orientation="vertical" data-invalid={!!error}>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <FieldContent>
    <Input id="email" aria-invalid={!!error} />
    <FieldDescription>We'll never share your email.</FieldDescription>
    {error && <FieldError errors={[error]} />}
  </FieldContent>
</Field>
```

### Grouped Fields with FieldSet

```tsx
import { FieldSet, FieldLegend, FieldGroup } from "@/components/ui/field"

<FieldSet>
  <FieldLegend>Personal Information</FieldLegend>
  <FieldGroup>
    <Field>…first name…</Field>
    <Field>…last name…</Field>
  </FieldGroup>
</FieldSet>
```

### Accessibility

- `FieldSet` / `FieldLegend` maintain semantic grouping for screen readers
- `Field` outputs `role="group"` for inherited labeling
- `data-invalid` on `Field` drives error styling via CSS attribute selectors
- `aria-invalid` on inputs signals validation state to assistive technology

## React Hook Form Integration

### Installation

```bash
npx shadcn add form
# also install peer deps:
npm install react-hook-form @hookform/resolvers zod
```

### Defining a Schema

```typescript
import { z } from "zod"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(32),
  description: z.string().min(20, "Too short").max(100),
})

type FormValues = z.infer<typeof formSchema>
```

### Setting Up the Form

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { title: "", description: "" },
  mode: "onSubmit", // see validation modes below
})
```

### Validation Modes

| Mode | Trigger |
|---|---|
| `onSubmit` | On form submit (default) |
| `onBlur` | When field loses focus |
| `onChange` | On every keystroke |
| `onTouched` | After first blur, then on change |
| `all` | On both blur and change |

### Controlled Fields with Controller

```tsx
import { Controller } from "react-hook-form"

<Controller
  control={form.control}
  name="title"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
      <Input
        {...field}
        id={field.name}
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

### Dynamic Array Fields

```tsx
import { useFieldArray } from "react-hook-form"

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "emails",
})

{fields.map((item, index) => (
  <Field key={item.id}>   {/* use item.id, not index */}
    <Input {...form.register(`emails.${index}.value`)} />
    <Button type="button" onClick={() => remove(index)}>Remove</Button>
  </Field>
))}

<Button type="button" onClick={() => append({ value: "" })}>Add Email</Button>
```

Array schemas with constraints:

```typescript
const schema = z.object({
  emails: z.array(z.object({ value: z.string().email() })).min(1).max(5),
})
```

### Submit Handler

```tsx
<form onSubmit={form.handleSubmit(async (values) => {
  // values is typed as FormValues
  console.log(values)
})}>
  {/* fields */}
  <Button type="submit">Submit</Button>
</form>
```

## TanStack Form Integration

### Installation

```bash
npm install @tanstack/react-form zod
```

### Setting Up the Form

```tsx
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"

const form = useForm({
  defaultValues: { title: "", description: "" },
  validators: {
    onSubmit: formSchema, // Zod schema
  },
  onSubmit: async ({ value }) => {
    console.log(value)
  },
})
```

### Field Render Prop Pattern

TanStack Form uses a render-prop pattern via `form.Field`:

```tsx
<form.Field
  name="title"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
        <Input
          id={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
        />
        {isInvalid && (
          <FieldError errors={field.state.meta.errors} />
        )}
      </Field>
    )
  }}
/>
```

### Field State Properties

| Property | Description |
|---|---|
| `field.state.value` | Current field value |
| `field.state.meta.isTouched` | Whether user has interacted |
| `field.state.meta.isValid` | Passes current validation |
| `field.state.meta.errors` | Array of error messages |

### Validation Modes

| Mode | Config key |
|---|---|
| On change | `validators: { onChange: schema }` |
| On blur | `validators: { onBlur: schema }` |
| On submit | `validators: { onSubmit: schema }` |

### Dynamic Array Fields

```tsx
<form.Field
  name="emails"
  mode="array"
  children={(field) => (
    <>
      {field.state.value.map((_, index) => (
        <form.Field
          key={index}
          name={`emails[${index}].value`}
          children={(subField) => (
            <Field>
              <Input
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
              <Button type="button" onClick={() => field.removeValue(index)}>
                Remove
              </Button>
            </Field>
          )}
        />
      ))}
      <Button type="button" onClick={() => field.pushValue({ value: "" })}>
        Add Email
      </Button>
    </>
  )}
/>
```

### Submit Handler

```tsx
<form
  onSubmit={(e) => {
    e.preventDefault()
    form.handleSubmit()
  }}
>
  {/* fields */}
  <Button type="submit">Submit</Button>
</form>
```

## Composing with Other Controls

Both form libraries work with any shadcn/ui input component inside `Field`. Common patterns:

### Select

```tsx
<Field data-invalid={isInvalid}>
  <FieldLabel>Role</FieldLabel>
  <Select onValueChange={field.onChange} defaultValue={field.value}>
    <SelectTrigger aria-invalid={isInvalid}>
      <SelectValue placeholder="Select a role" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="admin">Admin</SelectItem>
      <SelectItem value="user">User</SelectItem>
    </SelectContent>
  </Select>
  <FieldError errors={errors} />
</Field>
```

### Checkbox

```tsx
<Field orientation="horizontal" data-invalid={isInvalid}>
  <Checkbox
    id="terms"
    checked={field.value}
    onCheckedChange={field.onChange}
    aria-invalid={isInvalid}
  />
  <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
</Field>
```

### RadioGroup

```tsx
<Field data-invalid={isInvalid}>
  <FieldLabel>Notification preference</FieldLabel>
  <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
    <Field orientation="horizontal">
      <RadioGroupItem value="email" id="r-email" />
      <FieldLabel htmlFor="r-email">Email</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <RadioGroupItem value="sms" id="r-sms" />
      <FieldLabel htmlFor="r-sms">SMS</FieldLabel>
    </Field>
  </RadioGroup>
</Field>
```

## Choosing a Library

| Consideration | React Hook Form | TanStack Form |
|---|---|---|
| API style | Register / Controller | Render props (`form.Field`) |
| Bundle size | ~10 KB | ~15 KB |
| Array fields | `useFieldArray` hook | `mode="array"` + `pushValue`/`removeValue` |
| Validation | `zodResolver` adapter | Native Zod / Standard Schema |
| Maturity | Stable, widely adopted | Actively developed, v1 stable |
| Server actions | Possible via `action=` | Possible via `onSubmit` |

For most projects either works. React Hook Form is more widely documented and has a larger ecosystem. TanStack Form offers a more declarative render-prop API that some prefer for complex forms.
