/**
 * Journal Category master domain types.
 *
 * Mirrors the `journal_category` table:
 *   id     int          PK, auto-increment
 *   name   varchar(50)  required, unique
 *   remark varchar(50)  nullable
 *   status tinyint      required, default 1 (1 = Active, 2 = Inactive)
 */

/** 1 = Active, 2 = Inactive. */
export type JournalCategoryStatus = 1 | 2

export interface JournalCategory {
  id: number
  name: string
  remark: string | null
  status: JournalCategoryStatus
}

/** Payload to create a journal category (server assigns `id`). */
export interface CreateJournalCategoryInput {
  name: string
  remark?: string | null
  status: JournalCategoryStatus
}

/** Payload to update an existing journal category. */
export type UpdateJournalCategoryInput = CreateJournalCategoryInput
