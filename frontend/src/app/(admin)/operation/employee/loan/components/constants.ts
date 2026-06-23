/** Employee Loan routes. New (empty create form) is the default landing page. */
export const EMPLOYEE_LOAN_BASE_PATH = "/operation/employee/loan"
/** Default page — opens an empty New (create) form. */
export const EMPLOYEE_LOAN_NEW_PATH = EMPLOYEE_LOAN_BASE_PATH
/** List page — the DataTable of employee loans. */
export const EMPLOYEE_LOAN_LIST_PATH = `${EMPLOYEE_LOAN_BASE_PATH}/list`
/** Update (edit) page for a single employee loan record. */
export const employeeLoanEditPath = (id: number) =>
  `${EMPLOYEE_LOAN_BASE_PATH}/${id}/edit`
