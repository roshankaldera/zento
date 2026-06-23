/**
 * Crop master domain types.
 *
 * Mirrors the `crops` table:
 *   id     int          PK, auto-increment
 *   name   varchar(50)  required, unique
 *   remark varchar(50)  nullable
 *   status tinyint      required, default 1 (1 = Active, 2 = Inactive)
 */

/** 1 = Active, 2 = Inactive. */
export type CropStatus = 1 | 2

export interface Crop {
  id: number
  name: string
  remark: string | null
  status: CropStatus
}

/** Payload to create a crop (server assigns `id`). */
export interface CreateCropInput {
  name: string
  remark?: string | null
  status: CropStatus
}

/** Payload to update an existing crop. */
export type UpdateCropInput = CreateCropInput
