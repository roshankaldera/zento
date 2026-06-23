import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import Link from "next/link"
import React from "react"

import type { Option } from "@/components/hook-form"
import { Button } from "@/components/ui/button"
import { listBusinesses } from "@/lib/business-service"
import { listEmployees } from "@/lib/employee-service"
import {
  getItemTransaction,
  listItemsWithStock,
} from "@/lib/item-transaction-service"
import { ItemTransactionForm } from "../../components/item-transaction-form"
import { toItemTransactionFormValues } from "../../components/item-transaction-schema"
import { ITEM_TRANSACTION_LIST_PATH } from "../../components/constants"

export const metadata: Metadata = {
  title: "Edit Item Transaction | Zento",
  description: "Update an existing item transaction",
}

export default async function EditItemTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [transaction, businesses, employees, items] = await Promise.all([
    Number.isFinite(Number(id)) ? getItemTransaction(Number(id)) : undefined,
    listBusinesses().catch(() => []),
    listEmployees().catch(() => []),
    listItemsWithStock().catch(() => []),
  ])
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }))
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Item Transaction" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {transaction ? (
          <ItemTransactionForm
            mode="edit"
            itemTransactionId={transaction.id}
            defaultValues={toItemTransactionFormValues(transaction)}
            businessOptions={businessOptions}
            employeeOptions={employeeOptions}
            items={items}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This item transaction could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={ITEM_TRANSACTION_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
