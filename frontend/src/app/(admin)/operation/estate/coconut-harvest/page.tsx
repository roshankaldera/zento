import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { CoconutHarvestForm } from "./components/coconut-harvest-form";
import { coconutHarvestFormDefaults } from "./components/coconut-harvest-schema";

export const metadata: Metadata = {
  title: "New Coconut Harvest | Zento",
  description: "Add a new coconut harvest",
};

export default async function OperationEstateCoconutHarvestPage() {
  const businesses = await listBusinesses().catch(() => []);
  // Estates are businesses of type 1.
  const estateOptions: Option[] = businesses
    .filter((b) => b.type === 1)
    .map((b) => ({ label: b.name, value: String(b.id) }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Coconut Harvest" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CoconutHarvestForm
          mode="create"
          defaultValues={coconutHarvestFormDefaults}
          estateOptions={estateOptions}
        />
      </div>
    </div>
  );
}
