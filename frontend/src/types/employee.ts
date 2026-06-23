/**
 * Employee master domain types.
 *
 * Mirrors the `employee` table:
 *   id           int           PK, auto-increment
 *   business_id  int           required, FK -> business.id
 *   emp_no       varchar(20)   required, unique
 *   nic          varchar(12)   required, unique
 *   name         varchar(100)  required
 *   mobile1      varchar(10)   nullable
 *   mobile2      varchar(10)   nullable
 *   address      varchar(100)  nullable
 *   dob          date          nullable
 *   attend_type  tinyint       required (1=Shift, 2=Hourly)
 *   status       tinyint       required, default 1 (1=Active, 2=Inactive)
 */

/** 1 = Shift, 2 = Hourly. */
export type EmployeeAttendType = 1 | 2

/** 1 = Active, 2 = Inactive. */
export type EmployeeStatus = 1 | 2

export interface Employee {
  id: number
  businessId: number
  empNo: string
  nic: string
  name: string
  mobile1: string | null
  mobile2: string | null
  address: string | null
  /** ISO date-time string (date-only column) or null. */
  dob: string | null
  attendType: EmployeeAttendType
  status: EmployeeStatus
  /** Included by list/detail endpoints. */
  business?: { id: number; name: string }
}

/** Payload to create an employee (server assigns `id`). */
export interface CreateEmployeeInput {
  businessId: number
  empNo: string
  nic: string
  name: string
  mobile1?: string | null
  mobile2?: string | null
  address?: string | null
  /** Date-only string ("yyyy-MM-dd") or null. */
  dob?: string | null
  attendType: EmployeeAttendType
  status: EmployeeStatus
}

/** Payload to update an existing employee. */
export type UpdateEmployeeInput = CreateEmployeeInput
