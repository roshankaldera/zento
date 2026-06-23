"use client"

import * as React from "react"
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormStateReturn,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { BaseFieldProps } from "./types"

/**
 * Render-prop signature handed to every concrete field. Mirrors RHF's
 * Controller render args so wrappers stay thin.
 */
export interface RHFFieldRenderArgs<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>
  fieldState: ControllerFieldState
  formState: UseFormStateReturn<TFieldValues>
}

export interface RHFFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  /**
   * `vertical` (default) → label above the control.
   * `horizontal` → control left, label+description right (checkbox/switch).
   */
  orientation?: "vertical" | "horizontal"
  /**
   * When false, the control is rendered without a <FormControl> Slot wrapper.
   * Needed for composite controls (e.g. RadioGroup) that wire aria/id manually.
   */
  withControl?: boolean
  /** Renders the concrete control; receives the RHF Controller render args. */
  children: (args: RHFFieldRenderArgs<TFieldValues, TName>) => React.ReactNode
}

/**
 * The single source of truth for field chrome — label, description, validation
 * message, accessibility wiring and the RHF Controller binding. Every concrete
 * RHF component delegates here, eliminating the repeated FormField/FormItem/…
 * boilerplate (the chief duplicated pattern in hand-rolled forms).
 *
 * Re-render scope: only this field re-renders when its own value/error changes,
 * because FormMessage/FormLabel subscribe via `useFormState({ name })` rather
 * than the whole form state.
 */
export function RHFField<
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
  orientation = "vertical",
  withControl = true,
  children,
}: RHFFieldProps<TFieldValues, TName>) {
  return (
    <FormField<TFieldValues, TName>
      name={name}
      rules={rules}
      disabled={disabled}
      render={(args) => {
        const control = withControl ? (
          <FormControl>{children(args) as React.ReactElement}</FormControl>
        ) : (
          children(args)
        )

        if (orientation === "horizontal") {
          return (
            <FormItem
              className={cn(
                "flex flex-row items-start gap-3 space-y-0",
                className
              )}
            >
              {control}
              {(label || description) && (
                <div className="grid gap-1 leading-none">
                  {label && (
                    <FormLabel className="font-normal">
                      {label}
                      {required && <span className="text-destructive"> *</span>}
                    </FormLabel>
                  )}
                  {description && (
                    <FormDescription>{description}</FormDescription>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )
        }

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive"> *</span>}
              </FormLabel>
            )}
            {control}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
