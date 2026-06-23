/** Leave routes. New (empty create form) is the default landing page. */
export const LEAVE_BASE_PATH = "/operation/employee/leave"
/** Default page — opens an empty New (create) form. */
export const LEAVE_NEW_PATH = LEAVE_BASE_PATH
/** List page — the DataTable of leave records. */
export const LEAVE_LIST_PATH = `${LEAVE_BASE_PATH}/list`
/** Update (edit) page for a single leave record. */
export const leaveEditPath = (id: number) => `${LEAVE_BASE_PATH}/${id}/edit`
