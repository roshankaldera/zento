# Hook Form Library (`@/components/hook-form`)

Reusable, strongly-typed [React Hook Form](https://react-hook-form.com/) v7 field
components built on top of **shadcn/ui** primitives. Designed for large
ERP/CRM surfaces where the same fields are assembled hundreds of times.

## Design goals

- **No `control` prop drilling** — every field reads the form via
  `useFormContext()`. You only ever pass `name`.
- **Zod-ready values** — fields commit *domain* types (`number`, `Date`,
  `File`, `string[]`), not formatted strings, so a `zodResolver` schema
  validates committed values directly.
- **One source of truth for chrome** — label, description, validation message,
  and accessibility wiring live in a single `RHFField` wrapper. Concrete
  components only render their control.
- **Dark mode for free** — all styling flows through shadcn theme tokens
  (`bg-background`, `text-destructive`, …), so `.dark` just works.
- **SOLID** — each component has one responsibility; presets (Email, Currency,
  Percentage) compose a base rather than duplicating it; the base is open for
  extension via the render prop, closed for modification.

## Folder structure

```
src/components/
├── hook-form/
│   ├── index.ts                 # barrel export (import from here)
│   ├── types.ts                 # BaseFieldProps, Option, OptionGroup
│   ├── utils.ts                 # normalizeOptions, validateFile, formatBytes…
│   ├── rhf-form.tsx             # <RHFForm> = FormProvider + <form>
│   ├── rhf-field.tsx            # <RHFField> base wrapper (the keystone)
│   ├── rhf-input.tsx            # ── basic
│   ├── rhf-textarea.tsx
│   ├── rhf-number-input.tsx
│   ├── rhf-password-input.tsx
│   ├── rhf-email-input.tsx
│   ├── rhf-select.tsx           # ── selection
│   ├── rhf-multi-select.tsx
│   ├── rhf-autocomplete.tsx
│   ├── rhf-radio-group.tsx
│   ├── rhf-checkbox.tsx
│   ├── rhf-switch.tsx
│   ├── rhf-date-picker.tsx      # ── date & time
│   ├── rhf-date-range-picker.tsx
│   ├── rhf-time-picker.tsx
│   ├── rhf-currency-input.tsx   # ── advanced
│   ├── rhf-percentage-input.tsx
│   ├── rhf-file-upload.tsx
│   └── rhf-image-upload.tsx
└── ui/                          # shadcn primitives (form, input, select, …)
```

## Architecture

```
useForm()  ──►  <RHFForm form={form} onSubmit>     (FormProvider + <form>)
                      │  context: control + form state
                      ▼
                <RHFInput name="x" /> … any field
                      │  delegates chrome + Controller binding to
                      ▼
                <RHFField>                          ← the only place that knows
                  ├─ <FormItem> <FormLabel>            FormField/FormItem/…
                  ├─ <FormControl>{render(field)}</>
                  ├─ <FormDescription>
                  └─ <FormMessage>                  ← reads error via useFormField
```

`RHFField` calls the child as a render prop with RHF's `{ field, fieldState,
formState }`. A field component is therefore ~15 lines: wire `field` into a
shadcn control and pick an `orientation`.

## Usage

```tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  RHFForm, RHFInput, RHFEmailInput, RHFSelect,
  RHFDatePicker, RHFCurrencyInput, RHFSwitch,
} from "@/components/hook-form"
import { Button } from "@/components/ui/button"

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
  role: z.string().min(1, "Pick a role"),
  startDate: z.date(),
  salary: z.number().positive(),
  active: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function EmployeeForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: "", active: true },
  })

  return (
    <RHFForm form={form} onSubmit={(v) => console.log(v)} className="grid gap-4">
      <RHFInput<FormValues> name="name" label="Full name" required />
      <RHFEmailInput<FormValues> name="email" label="Email" required />
      <RHFSelect<FormValues>
        name="role"
        label="Role"
        options={["Admin", "Manager", "Staff"]}
      />
      <RHFDatePicker<FormValues> name="startDate" label="Start date" />
      <RHFCurrencyInput<FormValues> name="salary" label="Salary" currencySymbol="$" />
      <RHFSwitch<FormValues> name="active" label="Active" />
      <Button type="submit">Save</Button>
    </RHFForm>
  )
}
```

Passing the form generic (`RHFInput<FormValues>`) constrains `name` to real
keys and gives autocomplete; omitting it still works for quick/dynamic forms.

## Committed value per component

| Component                         | Field value type                  |
| --------------------------------- | --------------------------------- |
| Input / Textarea / Email / Password | `string`                        |
| NumberInput / Currency / Percentage | `number \| undefined`           |
| Select / Autocomplete / RadioGroup  | `string` (option value)         |
| MultiSelect                       | `string[]`                        |
| Checkbox / Switch                 | `boolean`                         |
| DatePicker                        | `Date \| undefined`               |
| DateRangePicker                   | `{ from?: Date; to?: Date }`      |
| TimePicker                        | `"HH:mm"` string                  |
| FileUpload / ImageUpload          | `File` or `File[]` (`multiple`)   |

## Common props (every component)

`name` (required), `label`, `description`, `disabled`, `required`, `className`
(targets the `FormItem` wrapper), `rules` (RHF rules escape hatch — prefer Zod).
Errors render automatically through `FormMessage`.

## Performance

- **Field-scoped re-renders.** `FormMessage`/`FormLabel` subscribe with
  `useFormState({ name })`, so typing in one field doesn't re-render siblings.
  Each `RHFField` is its own `Controller`.
- **Uncontrolled where possible.** Inputs use RHF's `Controller` (the form owns
  the value); React re-renders are localized rather than lifting state to a
  parent `useState`.
- **Prefer `mode: "onTouched"` or `"onBlur"`** over `"onChange"` for big forms
  to avoid validating on every keystroke.
- **Memoize `options` arrays** passed to Select/MultiSelect/Autocomplete so the
  combobox lists don't rebuild each render.
- **Object-URL hygiene.** `RHFImageUpload` revokes preview URLs on unmount /
  replacement to prevent leaks.
- For very large forms, split into sections and consider per-section
  `useForm` + `<RHFForm>` or RHF's `shouldUnregister` to drop hidden fields.

## Best practices for ERP/CRM

1. **Schema-first.** Define a Zod schema per form; derive the TS type with
   `z.infer`. The schema is the single contract for client + server validation.
2. **Centralize option sources.** Keep enums/lookups (roles, currencies,
   statuses) in one module and feed them as `Option[]`; never inline strings.
3. **One field, one component.** If you find yourself copying label + control +
   error markup, you've found a missing wrapper — add it here, not in the page.
4. **Compose presets.** Domain inputs (e.g. `RHFTaxIdInput`) should wrap
   `RHFInput`/`RHFNumberInput` with formatting + rules, like Currency does.
5. **Map at the boundary, not the field.** Keep Select values as strings; map to
   richer domain objects (or cents for currency) in the submit handler.
6. **Disable, don't hide, during submit.** Gate the form with
   `disabled={form.formState.isSubmitting}` for predictable UX.

## Extracted duplication (what this library removes)

The repeated hand-rolled pattern in raw forms is:

```tsx
<FormField control={control} name="x" render={({ field }) => (
  <FormItem>
    <FormLabel>…</FormLabel>
    <FormControl><Input {...field} /></FormControl>
    <FormDescription>…</FormDescription>
    <FormMessage />
  </FormItem>
)} />
```

That block — copied for every field, with `control` threaded through — is
collapsed into `RHFField`. Other extracted patterns: option normalization
(`normalizeOptions` accepts `string[]` or `Option[]`), numeric formatting
(`RHFNumberInput` → Currency/Percentage), file validation (`validateFile`,
`formatBytes`), and the FormProvider+`<form>`+submit wiring (`RHFForm`).

## Dependencies

`react-hook-form`, `@hookform/resolvers`, `zod`, `react-number-format`,
`react-day-picker` + `date-fns`, `react-dropzone`, `cmdk` (via shadcn command),
and the shadcn primitives in `src/components/ui`. Export uses **no extra libraries**.
