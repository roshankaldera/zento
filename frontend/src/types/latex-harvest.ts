/** 1 = Present, 2 = Absent, 3 = Rain, 4 = Rain+Work, 5 = Another duty. */
export type LatexLineStatus = 1 | 2 | 3 | 4 | 5

export interface LatexLine {
  id: number
  mainId: number
  employeeId: number
  /** Decimals serialized as strings by Prisma. */
  liter: number
  ottapalu: number
  status: LatexLineStatus
  employee?: { id: number; name: string; empNo: string }
}

export interface LatexHarvest {
  id: number
  estateId: number
  date: string
  rainfall: number | null
  remark: string | null
  estate?: { id: number; name: string }
  /** Present on detail (findOne) responses. */
  lines?: LatexLine[]
  /** Present on list (findAll) responses. */
  _count?: { lines: number }
}

/** A single line in the create/update payload (server assigns id + main_id). */
export interface CreateLatexLineInput {
  employeeId: number
  liter: number
  ottapalu: number
  status: LatexLineStatus
}

/** Payload to create a harvest header together with its lines. */
export interface CreateLatexHarvestInput {
  estateId: number
  date: string
  rainfall?: number | null
  remark?: string | null
  lines: CreateLatexLineInput[]
}

export type UpdateLatexHarvestInput = CreateLatexHarvestInput
