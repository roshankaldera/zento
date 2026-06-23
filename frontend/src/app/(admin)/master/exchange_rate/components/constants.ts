export const EXCHANGE_RATE_LIST_PATH = "/master/exchange_rate"
export const EXCHANGE_RATE_NEW_PATH = `${EXCHANGE_RATE_LIST_PATH}/new`
export const exchangeRateEditPath = (id: number) =>
  `${EXCHANGE_RATE_LIST_PATH}/${id}/edit`
