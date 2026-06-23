import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { Metadata } from "next"
import Link from "next/link"
import React from "react"

import type { Option } from "@/components/hook-form"
import { Button } from "@/components/ui/button"
import { listBusinesses } from "@/lib/business-service"
import { getReimbursement } from "@/lib/reimbursement-service"
import { ReimbursementForm } from "../../components/reimbursement-form"
import { toReimbursementFormValues } from "../../components/reimbursement-schema"
import { REIMBURSEMENT_LIST_PATH } from "../../components/constants"

export const metadata: Metadata = {
  title: "Edit Reimbursement | Zento",
  description: "Update an existing reimbursement",
}

export default async function EditReimbursementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [reimbursement, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getReimbursement(Number(id)) : undefined,
    listBusinesses().catch(() => []),
  ])
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Reimbursement" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {reimbursement ? (
          <ReimbursementForm
            mode="edit"
            reimbursementId={reimbursement.id}
            defaultValues={toReimbursementFormValues(reimbursement)}
            businessOptions={businessOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This reimbursement could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={REIMBURSEMENT_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
