/** 1 = Active, 2 = Finish, 3 = Canceled. */
export type EmployeeLoanStatus = 1 | 2 | 3

export interface EmployeeLoan {
  id: number
  employeeId: number
  issueDate: string | null
  /** Decimal money values are serialized as strings by Prisma. */
  value: number
  installment: number
  dueDay: number
  balance: number
  status: EmployeeLoanStatus
  employee?: { id: number; name: string; empNo: string }
}

/** Payload to create a loan (server assigns `id`; balance is system-managed). */
export interface CreateEmployeeLoanInput {
  employeeId: number
  issueDate?: string | null
  value: number
  installment: number
  dueDay: number
  balance: number
  status: EmployeeLoanStatus
}

export type UpdateEmployeeLoanInput = CreateEmployeeLoanInput
