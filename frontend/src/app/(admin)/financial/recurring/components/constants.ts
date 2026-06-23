/** Recurring routes. New (empty create form) is the default landing page. */
export const RECURRING_BASE_PATH = "/financial/recurring"
/** Default page — opens an empty New (create) form. */
export const RECURRING_NEW_PATH = RECURRING_BASE_PATH
/** List page — the DataTable of recurrings. */
export const RECURRING_LIST_PATH = `${RECURRING_BASE_PATH}/list`
/** Update (edit) page for a single recurring record. */
export const recurringEditPath = (id: number) =>
  `${RECURRING_BASE_PATH}/${id}/edit`
