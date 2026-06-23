"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RHFField } from "./rhf-field"
import { normalizeOptions, toArray } from "./utils"
import type { BaseFieldProps, Option } from "./types"

export interface RHFMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: ReadonlyArray<Option | string>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  /** Cap the number of selections. */
  maxItems?: number
  triggerClassName?: string
}

/**
 * Multi-select combobox with removable badges (Popover + cmdk). The field
 * value is an array of the selected option values.
 */
export function RHFMultiSelect<
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
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  maxItems,
  triggerClassName,
}: RHFMultiSelectProps<TFieldValues, TName>) {
  const items = normalizeOptions(options)
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
        const values = toArray(field.value) as unknown[]
        // Field values are dynamic here, so commit through a value-agnostic
        // onChange to keep the array element type from over-constraining.
        const commit = field.onChange as (value: unknown[]) => void
        const isSelected = (v: unknown) => values.includes(v)

        const toggle = (v: unknown) => {
          if (isSelected(v)) {
            commit(values.filter((x) => x !== v))
          } else if (!maxItems || values.length < maxItems) {
            commit([...values, v])
          }
        }

        const selectedOptions = items.filter((o) => isSelected(o.value))

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={field.ref}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled ?? field.disabled}
                onBlur={field.onBlur}
                className={cn(
                  "h-auto min-h-10 w-full justify-between font-normal",
                  !selectedOptions.length && "text-muted-foreground",
                  triggerClassName
                )}
              >
                <span className="flex flex-wrap gap-1">
                  {selectedOptions.length
                    ? selectedOptions.map((opt) => (
                        <Badge
                          key={String(opt.value)}
                          variant="secondary"
                          className="gap-1"
                        >
                          {opt.label}
                          <span
                            role="button"
                            tabIndex={-1}
                            aria-label={`Remove ${opt.label}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggle(opt.value)
                            }}
                            className="hover:text-foreground cursor-pointer"
                          >
                            <XIcon className="size-3" />
                          </span>
                        </Badge>
                      ))
                    : placeholder}
                </span>
                <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder={searchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {items.map((opt) => {
                      const checked = isSelected(opt.value)
                      const atLimit =
                        !!maxItems && values.length >= maxItems && !checked
                      return (
                        <CommandItem
                          key={String(opt.value)}
                          value={opt.label}
                          disabled={opt.disabled || atLimit}
                          onSelect={() => toggle(opt.value)}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 size-4",
                              checked ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {opt.label}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )
      }}
    </RHFField>
  )
}
