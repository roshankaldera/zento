import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listOtherHarvests } from "@/lib/other-harvest-service";
import type { OtherHarvest } from "@/types/other-harvest";
import { OtherHarvestListScreen } from "../components/other-harvest-list";

export const metadata: Metadata = {
  title: "Other Harvest | Zento",
  description: "Zento estate other-harvest records",
};

export default async function OperationEstateOtherHarvestListPage() {
  let initialOtherHarvests: OtherHarvest[] = [];
  let error: string | null = null;
  try {
    initialOtherHarvests = await listOtherHarvests();
  } catch {
    error = "Failed to load other harvests.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Other Harvest" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <OtherHarvestListScreen
          initialOtherHarvests={initialOtherHarvests}
          error={error}
        />
      </div>
    </div>
  );
}
