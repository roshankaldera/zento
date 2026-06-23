/** Attendance routes. New (empty create form) is the default landing page. */
export const ATTENDANCE_BASE_PATH = "/operation/employee/attendance"
/** Default page — opens an empty New (create) form. */
export const ATTENDANCE_NEW_PATH = ATTENDANCE_BASE_PATH
/** List page — the DataTable of attendance records. */
export const ATTENDANCE_LIST_PATH = `${ATTENDANCE_BASE_PATH}/list`
/** Update (edit) page for a single attendance record. */
export const attendanceEditPath = (id: number) =>
  `${ATTENDANCE_BASE_PATH}/${id}/edit`
