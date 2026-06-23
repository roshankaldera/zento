"use client"

import * as React from "react"
import type { FieldPath, FieldValues } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RHFField } from "./rhf-field"
import { normalizeOptions } from "./utils"
import type { BaseFieldProps, Option, OptionGroup } from "./types"

export interface RHFSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  /** Flat options (strings or Option objects) or grouped options. */
  options: ReadonlyArray<Option | string> | OptionGroup[]
  placeholder?: string
  /** Width/extra classes for the trigger. */
  triggerClassName?: string
}

function isGrouped(
  options: RHFSelectProps["options"]
): options is OptionGroup[] {
  return (
    options.length > 0 &&
    typeof options[0] === "object" &&
    options[0] !== null &&
    "options" in options[0]
  )
}

/**
 * Single-select dropdown bound to RHF. Values are strings (Radix Select
 * constraint); map to richer domain values in your submit handler if needed.
 * Supports flat or grouped options.
 */
export function RHFSelect<
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
  placeholder = "Select…",
  triggerClassName,
}: RHFSelectProps<TFieldValues, TName>) {
  const groups = isGrouped(options)

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
        <Select
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled ?? field.disabled}
        >
          <SelectTrigger
            ref={field.ref}
            onBlur={field.onBlur}
            className={triggerClassName}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {groups
              ? (options as OptionGroup[]).map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((opt) => (
                      <SelectItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                        disabled={opt.disabled}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))
              : normalizeOptions(
                  options as ReadonlyArray<Option | string>
                ).map((opt) => (
                  <SelectItem
                    key={String(opt.value)}
                    value={String(opt.value)}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      )}
    </RHFField>
  )
}
