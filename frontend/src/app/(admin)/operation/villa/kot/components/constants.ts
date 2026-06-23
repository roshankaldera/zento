/** KOT routes. New (empty create form) is the default landing page. */
export const KOT_BASE_PATH = "/operation/villa/kot"
/** Default page — opens an empty New (create) form. */
export const KOT_NEW_PATH = KOT_BASE_PATH
/** List page — the DataTable of KOTs. */
export const KOT_LIST_PATH = `${KOT_BASE_PATH}/list`
/** Update (edit) page for a single KOT record. */
export const kotEditPath = (id: number) => `${KOT_BASE_PATH}/${id}/edit`
