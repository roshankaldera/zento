import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listCrops } from "@/lib/crop-service";
import type { Crop } from "@/types/crop";
import { CropListScreen } from "./components/crop-list";

export const metadata: Metadata = {
  title: "Crop | Zento",
  description: "Zento Crop master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page
// re-runs (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterSubMastersCropPage() {
  let initialCrops: Crop[] = [];
  let error: string | null = null;
  try {
    initialCrops = await listCrops();
  } catch {
    error = "Failed to load crops.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Crop" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CropListScreen initialCrops={initialCrops} error={error} />
      </div>
    </div>
  );
}
