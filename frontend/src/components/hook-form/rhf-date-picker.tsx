"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  placeholder?: string
  /** date-fns format string for the trigger label. */
  displayFormat?: string
  /** Disable matcher passed to react-day-picker (e.g. past dates). */
  disabledDates?: React.ComponentProps<typeof Calendar>["disabled"]
  triggerClassName?: string
}

/**
 * Single-date picker (Popover + Calendar). The field value is a JS `Date`
 * (or `undefined`). Use a Zod `z.date()` schema to validate.
 */
export function RHFDatePicker<
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
  placeholder = "Pick a date",
  displayFormat = "PPP",
  disabledDates,
  triggerClassName,
}: RHFDatePickerProps<TFieldValues, TName>) {
  const [open, setOpen] = React.useState(false)

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
      {({ field }) => {
        const value: Date | undefined = field.value ?? undefined
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={field.ref}
                type="button"
                variant="outline"
                disabled={disabled ?? field.disabled}
                onBlur={field.onBlur}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  triggerClassName
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {value ? format(value, displayFormat) : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  field.onChange(date)
                  setOpen(false)
                }}
                disabled={disabledDates}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )
      }}
    </RHFField>
  )
}
