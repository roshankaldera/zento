/** Base route for the Journal Category master feature. */
export const JOURNAL_CATEGORY_LIST_PATH = "/master/sub-masters/journal_category"
export const JOURNAL_CATEGORY_NEW_PATH = `${JOURNAL_CATEGORY_LIST_PATH}/new`
export const journalCategoryEditPath = (id: number) =>
  `${JOURNAL_CATEGORY_LIST_PATH}/${id}/edit`
