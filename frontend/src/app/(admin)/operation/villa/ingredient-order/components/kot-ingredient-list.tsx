"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ERPDataTable } from "@/components/data-table"
import { deleteKotIngredient } from "@/lib/kot-ingredient-service"
import type { KotIngredient } from "@/types/kot-ingredient"
import { getKotIngredientColumns } from "./kot-ingredient-columns"
import {
  KOT_INGREDIENT_NEW_PATH,
  kotIngredientEditPath,
} from "./constants"

interface KotIngredientListScreenProps {
  initialKotIngredients: KotIngredient[]
  error?: string | null
}

export function KotIngredientListScreen({
  initialKotIngredients,
  error = null,
}: KotIngredientListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(KOT_INGREDIENT_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (row: KotIngredient) => {
      await deleteKotIngredient(row.id)
      refresh()
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getKotIngredientColumns({
        onEdit: (row) => router.push(kotIngredientEditPath(row.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete],
  )

  return (
    <ERPDataTable
      title="Ingredient Orders"
      description="Manage KOT ingredient orders."
      columns={columns}
      data={initialKotIngredients}
      loading={isPending}
      error={error}
      getRowId={(k) => String(k.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="ingredient-orders"
      searchPlaceholder="Search by description..."
      emptyMessage="No ingredient orders yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(KOT_INGREDIENT_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
