/** 1 = Active, 2 = Inactive. */
export type SupplierStatus = 1 | 2

export interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  contactNo: string | null
  /** Decimal serialized as string by Prisma; system-managed (not user-edited). */
  balance: number
  status: SupplierStatus
}

/** Payload to create a supplier (server assigns `id`; balance is system-managed). */
export interface CreateSupplierInput {
  name: string
  contactPerson?: string | null
  contactNo?: string | null
  balance: number
  status: SupplierStatus
}

export type UpdateSupplierInput = CreateSupplierInput
