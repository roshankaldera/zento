export const ITEM_TRANSACTION_LIST_PATH = "/operation/inventory/item-transaction"
export const ITEM_TRANSACTION_NEW_PATH = `${ITEM_TRANSACTION_LIST_PATH}/new`
export const itemTransactionEditPath = (id: number) =>
  `${ITEM_TRANSACTION_LIST_PATH}/${id}/edit`
