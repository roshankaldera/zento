/** 1 = Full Day, 2 = Day, 3 = Night. */
export type AttendanceShift = 1 | 2 | 3

/** 1 = Pending, 2 = Present, 3 = Absent, 4 = Off. */
export type AttendanceLineStatus = 1 | 2 | 3 | 4

export interface AttendanceLine {
  id: number
  mainId: number
  employeeId: number
  shift: AttendanceShift
  /** Decimal hours (may include a fraction, e.g. 8.5 = 8h 30m). */
  hours: number
  status: AttendanceLineStatus
  remark: string | null
  employee?: { id: number; name: string; empNo: string }
}

export interface Attendance {
  id: number
  businessId: number
  date: string
  remark: string | null
  business?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: AttendanceLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateAttendanceLineInput {
  employeeId: number
  shift: AttendanceShift
  hours: number
  status: AttendanceLineStatus
  remark?: string | null
}

/** Payload to create an attendance header together with its lines. */
export interface CreateAttendanceInput {
  businessId: number
  date: string
  remark?: string | null
  lines: CreateAttendanceLineInput[]
}

export type UpdateAttendanceInput = CreateAttendanceInput
