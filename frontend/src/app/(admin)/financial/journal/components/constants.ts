/** Journal entity routes. New (empty create form) is the default landing page. */
export const JOURNAL_BASE_PATH = "/financial/journal"
/** Default page — opens an empty New (create) form. */
export const JOURNAL_NEW_PATH = JOURNAL_BASE_PATH
/** List page — the DataTable of journals. */
export const JOURNAL_LIST_PATH = `${JOURNAL_BASE_PATH}/list`
/** Update (edit) page for a single journal record. */
export const journalEditPath = (id: number) => `${JOURNAL_BASE_PATH}/${id}/edit`
