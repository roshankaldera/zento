"use client"

import * as React from "react"
import {
  NumericFormat,
  type NumericFormatProps,
} from "react-number-format"
import type { FieldPath, FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFNumberInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName>,
    Omit<
      NumericFormatProps,
      "name" | "value" | "defaultValue" | "onValueChange" | "customInput"
    > {
  placeholder?: string
}

/**
 * Numeric input backed by `react-number-format`. The committed form value is a
 * real `number` (or `undefined` when empty) — not a formatted string — so Zod
 * `z.number()` schemas validate directly and no `valueAsNumber` coercion is
 * needed. Currency and Percentage inputs are thin presets over this.
 */
export function RHFNumberInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  disabled,
  required,
  className,
  rules,
  thousandSeparator = ",",
  ...numberProps
}: RHFNumberInputProps<TFieldValues, TName>) {
  return (
    <RHFField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      disabled={disabled}
      required={required}
      className={className}
      rules={rules}
    >
      {({ field }) => (
        <NumericFormat
          getInputRef={field.ref}
          name={field.name}
          value={field.value ?? ""}
          onBlur={field.onBlur}
          onValueChange={(values) => {
            // Commit the parsed float (undefined when the input is cleared).
            field.onChange(values.floatValue)
          }}
          disabled={disabled ?? field.disabled}
          thousandSeparator={thousandSeparator}
          customInput={Input}
          {...numberProps}
        />
      )}
    </RHFField>
  )
}
