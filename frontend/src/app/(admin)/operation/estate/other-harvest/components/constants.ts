/** Other Harvest routes. New (empty create form) is the default landing page. */
export const OTHER_HARVEST_BASE_PATH = "/operation/estate/other-harvest"
/** Default page — opens an empty New (create) form. */
export const OTHER_HARVEST_NEW_PATH = OTHER_HARVEST_BASE_PATH
/** List page — the DataTable of other-harvest records. */
export const OTHER_HARVEST_LIST_PATH = `${OTHER_HARVEST_BASE_PATH}/list`
/** Update (edit) page for a single other-harvest record. */
export const otherHarvestEditPath = (id: number) =>
  `${OTHER_HARVEST_BASE_PATH}/${id}/edit`
