import type { Option } from "@/components/hook-form"
import { listBusinesses } from "@/lib/business-service"
import { listCrops } from "@/lib/crop-service"
import { listSuppliers } from "@/lib/supplier-service"

export interface OtherHarvestOptions {
  /** Estates are businesses of type 1. */
  estateOptions: Option[]
  supplierOptions: Option[]
  cropOptions: Option[]
}

/** Load the estate/supplier/crop FK options the form needs (server-side). */
export async function loadOtherHarvestOptions(): Promise<OtherHarvestOptions> {
  const [businesses, suppliers, crops] = await Promise.all([
    listBusinesses().catch(() => []),
    listSuppliers().catch(() => []),
    listCrops().catch(() => []),
  ])

  return {
    estateOptions: businesses
      .filter((b) => b.type === 1)
      .map((b) => ({ label: b.name, value: String(b.id) })),
    supplierOptions: suppliers.map((s) => ({
      label: s.name,
      value: String(s.id),
    })),
    cropOptions: crops.map((c) => ({ label: c.name, value: String(c.id) })),
  }
}
