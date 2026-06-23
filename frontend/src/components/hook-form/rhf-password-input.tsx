"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import type { FieldPath, FieldValues } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { RHFField } from "./rhf-field"
import type { BaseFieldProps } from "./types"

export interface RHFPasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName>,
    Omit<
      React.ComponentProps<typeof Input>,
      "name" | "type" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref"
    > {
  /** Render the show/hide toggle button. Defaults to true. */
  revealable?: boolean
}

/**
 * Password field with an accessible show/hide toggle. The toggle is local UI
 * state only — never touches form values.
 */
export function RHFPasswordInput<
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
  revealable = true,
  autoComplete = "current-password",
  ...inputProps
}: RHFPasswordInputProps<TFieldValues, TName>) {
  const [visible, setVisible] = React.useState(false)

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
          <Input
            {...field}
            value={field.value ?? ""}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            disabled={disabled ?? field.disabled}
            {...inputProps}
            className={cn(revealable && "pr-10")}
          />
          {revealable && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((v) => !v)}
              disabled={disabled ?? field.disabled}
              aria-label={visible ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 disabled:opacity-50"
            >
              {visible ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          )}
        </div>
      )}
    </RHFField>
  )
}
