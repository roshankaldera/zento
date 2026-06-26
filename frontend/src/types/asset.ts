/** 1 = Investment, 2 = Vehicle, 3 = Building, 4 = Solar. */
export type AssetType = 1 | 2 | 3 | 4

/** 1 = Active, 2 = Inactive. */
export type AssetStatus = 1 | 2

export interface Asset {
  id: number
  businessId: number
  name: string
  type: AssetType
  status: AssetStatus
  remark: string | null
}

/** Payload to create an asset (server assigns `id`). */
export interface CreateAssetInput {
  businessId: number
  name: string
  type: AssetType
  status: AssetStatus
  remark?: string | null
}

export type UpdateAssetInput = CreateAssetInput
