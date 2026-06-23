/** Base route for the Business master feature. */
export const BUSINESS_LIST_PATH = "/master/business"
export const BUSINESS_NEW_PATH = `${BUSINESS_LIST_PATH}/new`
export const businessEditPath = (id: number) =>
  `${BUSINESS_LIST_PATH}/${id}/edit`
