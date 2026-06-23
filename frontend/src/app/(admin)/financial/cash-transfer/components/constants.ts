/** Cash Transfer routes. New (empty create form) is the default landing page. */
export const CASH_TRANSFER_BASE_PATH = "/financial/cash-transfer"
/** Default page — opens an empty New (create) form. */
export const CASH_TRANSFER_NEW_PATH = CASH_TRANSFER_BASE_PATH
/** List page — the DataTable of cash transfers. */
export const CASH_TRANSFER_LIST_PATH = `${CASH_TRANSFER_BASE_PATH}/list`
/** Update (edit) page for a single cash transfer record. */
export const cashTransferEditPath = (id: number) =>
  `${CASH_TRANSFER_BASE_PATH}/${id}/edit`
