import type { ReactNode } from "react"
import type { FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

/**
 * Shared, strongly-typed contracts for every RHF wrapper.
 *
 * Components use `useFormContext()` internally, so consumers never pass
 * `control` — only the field `name` (constrained to the form's shape when a
 * generic is supplied) plus presentational props.
 */

/** A selectable option used by Select / MultiSelect / Autocomplete / Radio. */
export interface Option<TValue = string> {
  label: string
  value: TValue
  description?: string
  disabled?: boolean
  /** Optional leading node (icon/avatar) for richer option rendering. */
  icon?: ReactNode
}

/** Grouped options for sectioned Selects. */
export interface OptionGroup<TValue = string> {
  label: string
  options: Option<TValue>[]
}

/**
 * Props common to every RHF field wrapper.
 *
 * @typeParam TFieldValues - the form's value shape; defaults to a permissive
 *   record so components can be used without an explicit generic, while
 *   library consumers can lock `name` to real form keys via `RHFInput<MyForm>`.
 */
export interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** Field path registered in the form (required). */
  name: TName
  /** Visible label rendered via FormLabel. Omit for label-less layouts. */
  label?: ReactNode
  /** Helper/description text rendered via FormDescription. */
  description?: ReactNode
  /** Disable the control. */
  disabled?: boolean
  /** Mark the field visually required (adds an asterisk). */
  required?: boolean
  /** Extra className applied to the FormItem wrapper. */
  className?: string
  /**
   * Field-level RHF rules. Prefer schema (Zod) validation, but this is the
   * escape hatch for ad-hoc rules without a resolver.
   */
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >
}

/** Re-exported for convenience so consumers import field generics from one place. */
export type { FieldPath, FieldValues } from "react-hook-form"
