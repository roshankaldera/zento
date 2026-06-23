/** 1 = Active, 2 = Inactive. */
export type AccountStatus = 1 | 2

export interface Account {
  id: number
  businessId: number
  code: string
  name: string
  groupId: number
  status: AccountStatus
  /** The parent group (account category), included by the API. */
  group?: { id: number; name: string }
  /** The owning business, included by the API. */
  business?: { id: number; name: string }
}

/** Payload to create an account (server assigns `id`). */
export interface CreateAccountInput {
  businessId: number
  code: string
  name: string
  groupId: number
  status: AccountStatus
}

export type UpdateAccountInput = CreateAccountInput
