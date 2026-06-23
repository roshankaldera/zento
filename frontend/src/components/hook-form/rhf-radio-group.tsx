"use client"

import * as React from "react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RHFField } from "./rhf-field"
import { normalizeOptions } from "./utils"
import type { BaseFieldProps, Option } from "./types"

export interface RHFRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: ReadonlyArray<Option | string>
  /** Lay items out in a row instead of a column. */
  orientation?: "vertical" | "horizontal"
}

/**
 * Radio group bound to RHF. Value is the selected option's string value.
 * Each item is paired with its own <Label htmlFor> for click-to-select a11y.
 */
export function RHFRadioGroup<
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
  options,
  orientation = "vertical",
}: RHFRadioGroupProps<TFieldValues, TName>) {
  const items = normalizeOptions(options)
  const reactId = React.useId()

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
        <RadioGroup
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled ?? field.disabled}
          className={cn(orientation === "horizontal" && "flex flex-wrap gap-6")}
        >
          {items.map((opt) => {
            const itemId = `${reactId}-${String(opt.value)}`
            return (
              <div key={String(opt.value)} className="flex items-center gap-2">
                <RadioGroupItem
                  id={itemId}
                  value={String(opt.value)}
                  disabled={opt.disabled}
                />
                <Label htmlFor={itemId} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      )}
    </RHFField>
  )
}
