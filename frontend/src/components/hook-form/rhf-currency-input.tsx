"use client"

import type { FieldPath, FieldValues } from "react-hook-form"

import { RHFNumberInput, type RHFNumberInputProps } from "./rhf-number-input"

export interface RHFCurrencyInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<RHFNumberInputProps<TFieldValues, TName>, "prefix" | "suffix"> {
  /** Currency symbol/prefix, e.g. "$", "€", "₹". Defaults to "$". */
  currencySymbol?: string
}

/**
 * Currency field — RHFNumberInput preset with thousands grouping, a fixed
 * 2-decimal scale and a currency prefix. The committed value is a `number`
 * (major units, e.g. dollars), ideal for `z.number()` validation. Convert to
 * minor units (cents) at the persistence boundary if your API expects integers.
 */
export function RHFCurrencyInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  currencySymbol = "",
  decimalScale = 2,
  fixedDecimalScale = true,
  allowNegative = false,
  placeholder = "0.00",
  ...props
}: RHFCurrencyInputProps<TFieldValues, TName>) {
  return (
    <RHFNumberInput<TFieldValues, TName>
      prefix={`${currencySymbol} `}
      decimalScale={decimalScale}
      fixedDecimalScale={fixedDecimalScale}
      allowNegative={allowNegative}
      placeholder={placeholder}
      {...props}
    />
  )
}
