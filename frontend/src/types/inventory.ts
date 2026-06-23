/** 1 = Nos, 2 = KG, 3 = Gram, 4 = Liter, 5 = Mililiter. */
export type InventoryUom = 1 | 2 | 3 | 4 | 5
/** 1 = Active, 2 = Inactive. */
export type InventoryStatus = 1 | 2

export interface InventoryStock {
  id: number
  mainId: number
  businessId: number
  /** Decimals serialized as strings by Prisma. */
  quantity: number
  avgCost: number
  business?: { id: number; name: string }
}

export interface Inventory {
  id: number
  applicableBusinesses: number[]
  name: string
  uom: InventoryUom
  status: InventoryStatus
  /** Present on detail (findOne) responses. */
  lines?: InventoryStock[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single stock line in the create/update payload (server assigns id + main_id). */
export interface CreateInventoryStockInput {
  businessId: number
  quantity: number
  avgCost: number
}

/** Payload to create an inventory header together with its stock lines. */
export interface CreateInventoryInput {
  applicableBusinesses: number[]
  name: string
  uom: InventoryUom
  status: InventoryStatus
  lines: CreateInventoryStockInput[]
}

export type UpdateInventoryInput = CreateInventoryInput
