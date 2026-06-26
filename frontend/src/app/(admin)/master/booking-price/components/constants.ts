export const BOOKING_PRICE_LIST_PATH = "/master/booking-price"
export const BOOKING_PRICE_NEW_PATH = `${BOOKING_PRICE_LIST_PATH}/new`
export const bookingPriceEditPath = (id: number) =>
  `${BOOKING_PRICE_LIST_PATH}/${id}/edit`
