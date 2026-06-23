/** Base route for the Employee master feature. */
export const EMPLOYEE_LIST_PATH = "/master/employee"
export const EMPLOYEE_NEW_PATH = `${EMPLOYEE_LIST_PATH}/new`
export const employeeEditPath = (id: number) =>
  `${EMPLOYEE_LIST_PATH}/${id}/edit`
