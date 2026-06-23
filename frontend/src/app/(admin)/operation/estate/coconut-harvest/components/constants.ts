/** Coconut Harvest routes. New (empty create form) is the default page. */
export const COCONUT_HARVEST_BASE_PATH = "/operation/estate/coconut-harvest"
/** Default page — opens an empty New (create) form. */
export const COCONUT_HARVEST_NEW_PATH = COCONUT_HARVEST_BASE_PATH
/** List page — the DataTable of coconut harvests. */
export const COCONUT_HARVEST_LIST_PATH = `${COCONUT_HARVEST_BASE_PATH}/list`
/** Update (edit) page for a single coconut harvest record. */
export const coconutHarvestEditPath = (id: number) =>
  `${COCONUT_HARVEST_BASE_PATH}/${id}/edit`
