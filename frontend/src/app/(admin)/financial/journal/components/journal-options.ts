import type { Option } from "@/components/hook-form"
import { listAccounts } from "@/lib/account-service"
import { listAssets } from "@/lib/asset-service"
import { listBanks } from "@/lib/bank-service"
import { listBusinesses } from "@/lib/business-service"
import { listEmployees } from "@/lib/employee-service"
import { listJournalCategories } from "@/lib/journal-category-service"
import { listSuppliers } from "@/lib/supplier-service"

/**
 * An option that also carries its owning `businessId`, so the form can filter
 * the list down to the selected business client-side.
 */
export interface BusinessScopedOption extends Option {
  businessId: number
}

export interface JournalOptions {
  businessOptions: Option[]
  bankOptions: BusinessScopedOption[]
  categoryOptions: Option[]
  accountOptions: BusinessScopedOption[]
  assetOptions: Option[]
  employeeOptions: Option[]
  supplierOptions: Option[]
}

/** Load every related list needed by the journal form (server-side). */
export async function loadJournalOptions(): Promise<JournalOptions> {
  const [businesses, banks, categories, accounts, assets, employees, suppliers] =
    await Promise.all([
      listBusinesses().catch(() => []),
      listBanks().catch(() => []),
      listJournalCategories().catch(() => []),
      listAccounts().catch(() => []),
      listAssets().catch(() => []),
      listEmployees().catch(() => []),
      listSuppliers().catch(() => []),
    ])

  return {
    businessOptions: businesses.map((b) => ({ label: b.name, value: String(b.id) })),
    bankOptions: banks.map((b) => ({
      label: b.branch ? `${b.bank} — ${b.branch}` : b.bank,
      value: String(b.id),
      businessId: b.businessId,
    })),
    categoryOptions: categories.map((c) => ({
      label: c.name,
      value: String(c.id),
    })),
    accountOptions: accounts.map((a) => ({
      label: `${a.code} — ${a.name}`,
      value: String(a.id),
      businessId: a.businessId,
    })),
    assetOptions: assets.map((a) => ({ label: a.name, value: String(a.id) })),
    employeeOptions: employees.map((e) => ({
      label: `${e.empNo} — ${e.name}`,
      value: String(e.id),
    })),
    supplierOptions: suppliers.map((s) => ({
      label: s.name,
      value: String(s.id),
    })),
  }
}
