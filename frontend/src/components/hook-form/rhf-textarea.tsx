"use client"

import * as React from "react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName>,
    Omit<
      React.ComponentProps<typeof Textarea>,
      "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref"
    > {}

/** Multi-line text field bound to RHF via context. */
export function RHFTextarea<
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
  ...textareaProps
}: RHFTextareaProps<TFieldValues, TName>) {
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
        <Textarea
          {...field}
          value={field.value ?? ""}
          disabled={disabled ?? field.disabled}
          {...textareaProps}
        />
      )}
    </RHFField>
  )
}
