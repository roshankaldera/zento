/** 1 = Fullday, 2 = Halfday. */
export type LeavePeriod = 1 | 2

export interface Leave {
  id: number
  date: string
  employeeId: number
  period: LeavePeriod
  reason: string | null
  employee?: { id: number; name: string; empNo: string }
}

/** Payload to create a leave (server assigns `id`). */
export interface CreateLeaveInput {
  date: string
  employeeId: number
  period: LeavePeriod
  reason?: string | null
}

export type UpdateLeaveInput = CreateLeaveInput
