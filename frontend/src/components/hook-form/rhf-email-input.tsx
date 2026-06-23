"use client"

import type { FieldPath, FieldValues } from "react-hook-form"

import { RHFInput, type RHFInputProps } from "./rhf-input"

export type RHFEmailInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<RHFInputProps<TFieldValues, TName>, "type">

/**
 * Email field — RHFInput preset with `type="email"`, sensible autocomplete and
 * mobile keyboard hints. Pair with a Zod `.email()` schema for validation.
 */
export function RHFEmailInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: RHFEmailInputProps<TFieldValues, TName>) {
  return (
    <RHFInput<TFieldValues, TName>
      type="email"
      inputMode="email"
      autoComplete="email"
      autoCapitalize="none"
      spellCheck={false}
      placeholder="name@company.com"
      {...props}
    />
  )
}
