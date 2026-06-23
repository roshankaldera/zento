"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFTimePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  /** Step in seconds; pass 1 to enable a seconds field. Defaults to 60. */
  step?: number
  min?: string
  max?: string
  className?: string
}

/**
 * Time field using the native time input (locale-aware, accessible, no extra
 * deps). The field value is a `"HH:mm"` (or `"HH:mm:ss"`) string.
 */
export function RHFTimePicker<
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
  step = 60,
  min,
  max,
}: RHFTimePickerProps<TFieldValues, TName>) {
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
        <div className="relative">
          <ClockIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            {...field}
            type="time"
            value={field.value ?? ""}
            step={step}
            min={min}
            max={max}
            disabled={disabled ?? field.disabled}
            className={cn("pl-9 [&::-webkit-calendar-picker-indicator]:opacity-60")}
          />
        </div>
      )}
    </RHFField>
  )
}
