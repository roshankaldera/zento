/** Latex Harvest routes. New (empty create form) is the default page. */
export const LATEX_HARVEST_BASE_PATH = "/operation/estate/latex-harvest"
/** Default page — opens an empty New (create) form. */
export const LATEX_HARVEST_NEW_PATH = LATEX_HARVEST_BASE_PATH
/** List page — the DataTable of latex harvests. */
export const LATEX_HARVEST_LIST_PATH = `${LATEX_HARVEST_BASE_PATH}/list`
/** Update (edit) page for a single latex harvest record. */
export const latexHarvestEditPath = (id: number) =>
  `${LATEX_HARVEST_BASE_PATH}/${id}/edit`
