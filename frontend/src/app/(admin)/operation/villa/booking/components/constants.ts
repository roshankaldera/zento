/** Booking routes. The Booking Calendar is the default landing page. */
export const BOOKING_BASE_PATH = "/operation/villa/booking"
/** Default page — the monthly Booking Calendar. */
export const BOOKING_CALENDAR_PATH = BOOKING_BASE_PATH
/** New page — opens an empty New (create) booking form. */
export const BOOKING_NEW_PATH = `${BOOKING_BASE_PATH}/new`
/** List page — the DataTable of bookings. */
export const BOOKING_LIST_PATH = `${BOOKING_BASE_PATH}/list`
/** Update (edit) page for a single booking record. */
export const bookingEditPath = (id: number) => `${BOOKING_BASE_PATH}/${id}/edit`
