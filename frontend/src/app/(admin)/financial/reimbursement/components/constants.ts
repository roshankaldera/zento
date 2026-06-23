/** Reimbursement routes. New (empty create form) is the default landing page. */
export const REIMBURSEMENT_BASE_PATH = "/financial/reimbursement"
/** Default page — opens an empty New (create) form. */
export const REIMBURSEMENT_NEW_PATH = REIMBURSEMENT_BASE_PATH
/** List page — the DataTable of reimbursements. */
export const REIMBURSEMENT_LIST_PATH = `${REIMBURSEMENT_BASE_PATH}/list`
/** Update (edit) page for a single reimbursement record. */
export const reimbursementEditPath = (id: number) =>
  `${REIMBURSEMENT_BASE_PATH}/${id}/edit`
