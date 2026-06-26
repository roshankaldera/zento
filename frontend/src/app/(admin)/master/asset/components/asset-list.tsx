"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ERPDataTable } from "@/components/data-table"
import { AssetApiError, deleteAsset } from "@/lib/asset-service"
import type { Asset } from "@/types/asset"
import { getAssetColumns } from "./asset-columns"
import { ASSET_NEW_PATH, assetEditPath } from "./constants"

interface AssetListScreenProps {
  initialAssets: Asset[]
  businessNameById: Record<number, string>
  error?: string | null
}

export function AssetListScreen({
  initialAssets,
  businessNameById,
  error = null,
}: AssetListScreenProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    router.prefetch(ASSET_NEW_PATH)
  }, [router])

  const refresh = React.useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  const handleDelete = React.useCallback(
    async (asset: Asset) => {
      try {
        await deleteAsset(asset.id)
        toast.success("Asset deleted.")
        refresh()
      } catch (err) {
        toast.error(
          err instanceof AssetApiError
            ? err.message
            : "Failed to delete asset. Please try again.",
        )
      }
    },
    [refresh],
  )

  const columns = React.useMemo(
    () =>
      getAssetColumns({
        businessNameById,
        onEdit: (asset) => router.push(assetEditPath(asset.id)),
        onDelete: handleDelete,
      }),
    [router, handleDelete, businessNameById],
  )

  return (
    <ERPDataTable
      title="Assets"
      description="Manage asset master records."
      columns={columns}
      data={initialAssets}
      loading={isPending}
      error={error}
      getRowId={(a) => String(a.id)}
      searchable
      pagination
      exportCsv
      exportExcel
      exportFileName="assets"
      searchPlaceholder="Search assets..."
      emptyMessage="No assets yet. Click New to add one."
      addLabel="New"
      onAdd={() => router.push(ASSET_NEW_PATH)}
      onRefresh={refresh}
    />
  )
}
