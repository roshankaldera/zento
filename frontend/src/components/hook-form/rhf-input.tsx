"use client"

import * as React from "react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName>,
    Omit<
      React.ComponentProps<typeof Input>,
      "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref"
    > {}

/**
 * Text input bound to RHF via context. The base of the basic-input family;
 * Email/Password/Number specialize it. Renders `value ?? ""` to stay a
 * controlled input even when the field default is `undefined`.
 */
export function RHFInput<
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
  ...inputProps
}: RHFInputProps<TFieldValues, TName>) {
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
        <Input
          {...field}
          value={field.value ?? ""}
          disabled={disabled ?? field.disabled}
          {...inputProps}
        />
      )}
    </RHFField>
  )
}
