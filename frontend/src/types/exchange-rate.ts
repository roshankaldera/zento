/** 2 = USD, 3 = EURO. */
export type ExchangeRateCurrency = 2 | 3

export interface ExchangeRate {
  id: number
  currencyId: ExchangeRateCurrency
  date: string
  /** Decimal serialized as string by Prisma. */
  rate: number
}

/** Payload to create an exchange rate (server assigns `id`). */
export interface CreateExchangeRateInput {
  currencyId: ExchangeRateCurrency
  date: string
  rate: number
}

export type UpdateExchangeRateInput = CreateExchangeRateInput
