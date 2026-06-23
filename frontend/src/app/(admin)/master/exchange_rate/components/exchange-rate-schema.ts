import { format, parseISO } from "date-fns"
import { z } from "zod"

import type { Option } from "@/components/hook-form"
import type {
  ExchangeRate,
  ExchangeRateCurrency,
} from "@/types/exchange-rate"

/**
 * Exchange Rate form contract. `currencyId` is committed as a string (Radix
 * Select); `date` is a real `Date`; `rate` is a real number. Mapped back at the
 * submit boundary (see `toExchangeRateInput`).
 */
export const exchangeRateSchema = z.object({
  currencyId: z.enum(["2", "3"]),
  date: z.date({ error: "Date is required" }),
  rate: z
    .number({ error: "Rate is required" })
    .min(0, "Rate cannot be negative"),
})

export type ExchangeRateFormValues = z.infer<typeof exchangeRateSchema>

/** Currency dropdown options (value matches the int stored in the DB). */
export const currencyOptions: Option[] = [
  { label: "USD", value: "2" },
  { label: "EURO", value: "3" },
]

/** Human label for a stored currency id. */
export const currencyLabel = (currencyId: number): string =>
  currencyOptions.find((o) => o.value === String(currencyId))?.label ?? "—"

/** Format a rate value (Prisma serializes decimals as strings). */
export const formatRate = (value: number | string): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/** Default values for the create form. */
export const exchangeRateFormDefaults: ExchangeRateFormValues = {
  currencyId: "2",
  // Validation enforces a real date on submit; the picker handles `undefined`.
  date: undefined as unknown as Date,
  rate: 0,
}

/** Map a loaded record into form values (numbers -> strings, ISO -> Date). */
export function toExchangeRateFormValues(
  exchangeRate: ExchangeRate,
): ExchangeRateFormValues {
  return {
    currencyId: String(
      exchangeRate.currencyId,
    ) as ExchangeRateFormValues["currencyId"],
    date: parseISO(exchangeRate.date.slice(0, 10)),
    rate: Number(exchangeRate.rate),
  }
}

/** Map submitted form values into the service input (strings -> numbers). */
export function toExchangeRateInput(values: ExchangeRateFormValues) {
  return {
    currencyId: Number(values.currencyId) as ExchangeRateCurrency,
    date: format(values.date, "yyyy-MM-dd"),
    rate: values.rate,
  }
}
