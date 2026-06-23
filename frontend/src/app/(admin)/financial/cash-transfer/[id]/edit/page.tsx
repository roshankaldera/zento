import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import Link from "next/link"
import React from "react"

import type { Option } from "@/components/hook-form"
import { Button } from "@/components/ui/button"
import { listBanks } from "@/lib/bank-service"
import { getCashTransfer } from "@/lib/cash-transfer-service"
import { CashTransferForm } from "../../components/cash-transfer-form"
import { toCashTransferFormValues } from "../../components/cash-transfer-schema"
import { CASH_TRANSFER_LIST_PATH } from "../../components/constants"

export const metadata: Metadata = {
  title: "Edit Cash Transfer | Zento",
  description: "Update an existing cash transfer",
}

export default async function EditCashTransferPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [row, banks] = await Promise.all([
    Number.isFinite(Number(id)) ? getCashTransfer(Number(id)) : undefined,
    listBanks().catch(() => []),
  ])
  const bankOptions: Option[] = banks.map((b) => ({
    label: b.branch ? `${b.bank} — ${b.branch}` : b.bank,
    value: String(b.id),
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Cash Transfer" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {row ? (
          <CashTransferForm
            mode="edit"
            cashTransferId={row.id}
            defaultValues={toCashTransferFormValues(row)}
            bankOptions={bankOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This cash transfer could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={CASH_TRANSFER_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
