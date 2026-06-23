"use client"

import type { FieldPath, FieldValues } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {}

/** Boolean toggle (horizontal layout). Field value is a `boolean`. */
export function RHFSwitch<
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
}: RHFSwitchProps<TFieldValues, TName>) {
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
        <Switch
          ref={field.ref}
          checked={!!field.value}
          onCheckedChange={field.onChange}
          disabled={disabled ?? field.disabled}
        />
      )}
    </RHFField>
  )
}
