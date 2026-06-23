"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
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
import { findOption, normalizeOptions } from "./utils"
import type { BaseFieldProps, Option } from "./types"

export interface RHFAutocompleteProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: ReadonlyArray<Option | string>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  triggerClassName?: string
}

/**
 * Single-select searchable combobox (Popover + cmdk). Value is the chosen
 * option's value. Selecting the active option again clears it.
 */
export function RHFAutocomplete<
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
  triggerClassName,
}: RHFAutocompleteProps<TFieldValues, TName>) {
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
        const selected = findOption(items, field.value)
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
                  "w-full justify-between font-normal",
                  !selected && "text-muted-foreground",
                  triggerClassName
                )}
              >
                <span className="truncate">
                  {selected ? selected.label : placeholder}
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
                    {items.map((opt) => (
                      <CommandItem
                        key={String(opt.value)}
                        value={opt.label}
                        disabled={opt.disabled}
                        onSelect={() => {
                          field.onChange(
                            opt.value === field.value ? undefined : opt.value
                          )
                          setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            opt.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {opt.label}
                      </CommandItem>
                    ))}
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
