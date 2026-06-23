import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listCoconutHarvests } from "@/lib/coconut-harvest-service";
import type { CoconutHarvest } from "@/types/coconut-harvest";
import { CoconutHarvestListScreen } from "../components/coconut-harvest-list";

export const metadata: Metadata = {
  title: "Coconut Harvest | Zento",
  description: "Zento estate coconut harvest records",
};

export default async function OperationEstateCoconutHarvestListPage() {
  let initialCoconutHarvests: CoconutHarvest[] = [];
  let error: string | null = null;
  try {
    initialCoconutHarvests = await listCoconutHarvests();
  } catch {
    error = "Failed to load coconut harvests.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Coconut Harvest" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CoconutHarvestListScreen
          initialCoconutHarvests={initialCoconutHarvests}
          error={error}
        />
      </div>
    </div>
  );
}
