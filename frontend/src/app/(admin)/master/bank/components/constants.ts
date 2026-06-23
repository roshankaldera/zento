/** Base route for the Bank master feature. */
export const BANK_LIST_PATH = "/master/bank"
export const BANK_NEW_PATH = `${BANK_LIST_PATH}/new`
export const bankEditPath = (id: number) => `${BANK_LIST_PATH}/${id}/edit`
