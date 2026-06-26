import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getAsset } from "@/lib/asset-service";
import { listBusinesses } from "@/lib/business-service";
import { AssetForm } from "../../components/asset-form";
import { toAssetFormValues } from "../../components/asset-schema";
import { ASSET_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Asset | Zento",
  description: "Update an existing asset",
};

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = Number.isFinite(Number(id))
    ? await getAsset(Number(id))
    : undefined;
  const businesses = await listBusinesses().catch(() => []);
  const businessOptions = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Asset" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {asset ? (
          <AssetForm
            mode="edit"
            assetId={asset.id}
            defaultValues={toAssetFormValues(asset)}
            businessOptions={businessOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This asset could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={ASSET_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
