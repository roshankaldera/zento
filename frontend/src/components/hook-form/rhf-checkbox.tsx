"use client"

import type { FieldPath, FieldValues } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {}

/**
 * Single boolean checkbox (horizontal layout: control + label/description).
 * The field value is a `boolean`. For multi-value checkbox groups, compose
 * several of these against array fields, or build a dedicated group component.
 */
export function RHFCheckbox<
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
}: RHFCheckboxProps<TFieldValues, TName>) {
  return (
    <RHFField<TFieldValues, TName>
      name={name}
      label={label}
      description={description}
      disabled={disabled}
      required={required}
      className={className}
      rules={rules}
      orientation="horizontal"
    >
      {({ field }) => (
        <Checkbox
          ref={field.ref}
          checked={!!field.value}
          onCheckedChange={(checked) => field.onChange(checked === true)}
          onBlur={field.onBlur}
          disabled={disabled ?? field.disabled}
        />
      )}
    </RHFField>
  )
}
