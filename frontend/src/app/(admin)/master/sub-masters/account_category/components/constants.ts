/** Base route for the Account Category master feature. */
export const ACCOUNT_CATEGORY_LIST_PATH = "/master/sub-masters/account_category"
export const ACCOUNT_CATEGORY_NEW_PATH = `${ACCOUNT_CATEGORY_LIST_PATH}/new`
export const accountCategoryEditPath = (id: number) =>
  `${ACCOUNT_CATEGORY_LIST_PATH}/${id}/edit`
