"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { deleteSupplier, SupplierApiError } from "@/lib/supplier-service"
import type { Supplier } from "@/types/supplier"
import { getSupplierColumns } from "./supplier-columns"
import { SUPPLIER_NEW_PATH, supplierEditPath } from "./constants"

interface SupplierListScreenProps {
  initialSuppliers: Supplier[]
  error?: string | null
}

export function SupplierListScreen({
  initialSuppliers,
  error = null,
}: SupplierListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(SUPPLIER_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (supplier: Supplier) => {
      try {
        await deleteSupplier(supplier.id)
        toast.success("Supplier deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof SupplierApiError
            ? err.message
            : "Failed to delete supplier. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getSupplierColumns({
        onEdit: (supplier) => router.push(supplierEditPath(supplier.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Suppliers"
      description="Manage supplier master records."
      columns={columns}
      data={initialSuppliers}
      loading={isPending}
      error={error}
      getRowId={(s) => String(s.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="suppliers"
      searchPlaceholder="Search suppliers..."
      emptyMessage="No suppliers yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(SUPPLIER_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
