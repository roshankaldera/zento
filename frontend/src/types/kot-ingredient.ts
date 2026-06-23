/** 1 = Nos, 2 = KG, 3 = Gram, 4 = Liter, 5 = Milliliter. */
export type KotIngredientUom = 1 | 2 | 3 | 4 | 5

export interface KotIngredientLine {
  id: number
  mainId: number
  item: string
  uom: KotIngredientUom
  /** Decimals serialized as strings by Prisma. */
  requestQuantity: number
  receivedQuantity: number
  remark: string | null
}

export interface KotIngredient {
  id: number
  kotIds: number[]
  date: string
  remark: string | null
  /** Present on detail (findOne) responses. */
  lines?: KotIngredientLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateKotIngredientLineInput {
  item: string
  uom: KotIngredientUom
  requestQuantity: number
  receivedQuantity: number
  remark?: string | null
}

/** Payload to create a KOT Ingredient header together with its lines. */
export interface CreateKotIngredientInput {
  kotIds: number[]
  date: string
  remark?: string | null
  lines: CreateKotIngredientLineInput[]
}

export type UpdateKotIngredientInput = CreateKotIngredientInput
