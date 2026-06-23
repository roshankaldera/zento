import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listAssets } from "@/lib/asset-service";
import type { Asset } from "@/types/asset";
import { AssetListScreen } from "./components/asset-list";

export const metadata: Metadata = {
  title: "Asset | Zento",
  description: "Zento asset master records",
};

export default async function MasterAssetPage() {
  let initialAssets: Asset[] = [];
  let error: string | null = null;
  try {
    initialAssets = await listAssets();
  } catch {
    error = "Failed to load assets.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Asset" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AssetListScreen initialAssets={initialAssets} error={error} />
      </div>
    </div>
  );
}
