/** 1 = Active, 2 = Inactive. */
export type UserStatus = 1 | 2

/** The password hash is never returned by the API. */
export interface User {
  id: number
  fullName: string
  userName: string
  defaultBusiness: number | null
  accessibleBusinesses: number[]
  status: UserStatus
  remark: string | null
}

/**
 * Payload to create/update a user. `password` is optional on the wire: required
 * on create (enforced in the form), and on edit it is sent only when changed
 * (blank keeps the current password).
 */
export interface CreateUserInput {
  fullName: string
  userName: string
  password?: string
  defaultBusiness?: number | null
  accessibleBusinesses: number[]
  status: UserStatus
  remark?: string | null
}

export type UpdateUserInput = CreateUserInput
