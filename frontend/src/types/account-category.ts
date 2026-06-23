/**
 * Account Category master domain types.
 *
 * Mirrors the `account_category` table:
 *   id     int          PK, auto-increment
 *   name   varchar(50)  required, unique
 *   remark varchar(50)  nullable
 *   status tinyint      required, default 1 (1 = Active, 2 = Inactive)
 */

/** 1 = Active, 2 = Inactive. */
export type AccountCategoryStatus = 1 | 2

export interface AccountCategory {
  id: number
  name: string
  remark: string | null
  status: AccountCategoryStatus
}

/** Payload to create an account category (server assigns `id`). */
export interface CreateAccountCategoryInput {
  name: string
  remark?: string | null
  status: AccountCategoryStatus
}

/** Payload to update an existing account category. */
export type UpdateAccountCategoryInput = CreateAccountCategoryInput
