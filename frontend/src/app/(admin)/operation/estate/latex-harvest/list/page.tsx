import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listLatexHarvests } from "@/lib/latex-harvest-service";
import type { LatexHarvest } from "@/types/latex-harvest";
import { LatexHarvestListScreen } from "../components/latex-harvest-list";

export const metadata: Metadata = {
  title: "Latex Harvest | Zento",
  description: "Zento estate latex harvest records",
};

export default async function OperationEstateLatexHarvestListPage() {
  let initialLatexHarvests: LatexHarvest[] = [];
  let error: string | null = null;
  try {
    initialLatexHarvests = await listLatexHarvests();
  } catch {
    error = "Failed to load latex harvests.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Latex Harvest" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <LatexHarvestListScreen
          initialLatexHarvests={initialLatexHarvests}
          error={error}
        />
      </div>
    </div>
  );
}
