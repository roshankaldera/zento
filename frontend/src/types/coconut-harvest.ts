export interface CoconutDivisionLine {
  id: number
  mainId: number
  divisionId: number
  quantity: number
  division?: { id: number; name: string }
}

export interface CoconutHarvest {
  id: number
  estateId: number
  date: string
  remark: string | null
  estate?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: CoconutDivisionLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateCoconutDivisionLineInput {
  divisionId: number
  quantity: number
}

/** Payload to create a harvest header together with its lines. */
export interface CreateCoconutHarvestInput {
  estateId: number
  date: string
  remark?: string | null
  lines: CreateCoconutDivisionLineInput[]
}

export type UpdateCoconutHarvestInput = CreateCoconutHarvestInput
