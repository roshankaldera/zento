"use client"

import type { FieldPath, FieldValues } from "react-hook-form"

import { RHFNumberInput, type RHFNumberInputProps } from "./rhf-number-input"

export interface RHFPercentageInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<RHFNumberInputProps<TFieldValues, TName>, "prefix" | "suffix"> {
  /** Clamp values to 0–100. Defaults to true. */
  clampToHundred?: boolean
}

/**
 * Percentage field — RHFNumberInput preset with a `%` suffix. The committed
 * value is the numeric percentage (e.g. `12.5` for 12.5%), not a 0–1 fraction.
 */
export function RHFPercentageInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  clampToHundred = true,
  decimalScale = 2,
  allowNegative = false,
  placeholder = "0",
  ...props
}: RHFPercentageInputProps<TFieldValues, TName>) {
  return (
    <RHFNumberInput<TFieldValues, TName>
      suffix=" %"
      decimalScale={decimalScale}
      allowNegative={allowNegative}
      placeholder={placeholder}
      isAllowed={
        clampToHundred
          ? (values) =>
              values.floatValue === undefined || values.floatValue <= 100
          : undefined
      }
      {...props}
    />
  )
}
