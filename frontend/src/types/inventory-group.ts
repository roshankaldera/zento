/**
 * Inventory Group master domain types.
 *
 * Mirrors the `inventory_group` table:
 *   id     int          PK, auto-increment
 *   name   varchar(50)  required, unique
 *   remark varchar(50)  nullable
 *   status tinyint      required, default 1 (1 = Active, 2 = Inactive)
 */

/** 1 = Active, 2 = Inactive. */
export type InventoryGroupStatus = 1 | 2

export interface InventoryGroup {
  id: number
  name: string
  remark: string | null
  status: InventoryGroupStatus
}

/** Payload to create an inventory group (server assigns `id`). */
export interface CreateInventoryGroupInput {
  name: string
  remark?: string | null
  status: InventoryGroupStatus
}

/** Payload to update an existing inventory group. */
export type UpdateInventoryGroupInput = CreateInventoryGroupInput
