"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
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

export interface RHFDateRangePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  placeholder?: string
  displayFormat?: string
  /** Number of months to show side-by-side. Defaults to 2. */
  numberOfMonths?: number
  disabledDates?: React.ComponentProps<typeof Calendar>["disabled"]
  triggerClassName?: string
}

/**
 * Date-range picker (Popover + Calendar in range mode). The field value is a
 * `{ from?: Date; to?: Date }` (react-day-picker's `DateRange`).
 */
export function RHFDateRangePicker<
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
  placeholder = "Pick a date range",
  displayFormat = "LLL dd, y",
  numberOfMonths = 2,
  disabledDates,
  triggerClassName,
}: RHFDateRangePickerProps<TFieldValues, TName>) {
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
        const value = (field.value ?? undefined) as DateRange | undefined
        const labelText = value?.from
          ? value.to
            ? `${format(value.from, displayFormat)} – ${format(value.to, displayFormat)}`
            : format(value.from, displayFormat)
          : placeholder
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
                  !value?.from && "text-muted-foreground",
                  triggerClassName
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {labelText}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={value}
                onSelect={(range) => field.onChange(range)}
                numberOfMonths={numberOfMonths}
                defaultMonth={value?.from}
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
