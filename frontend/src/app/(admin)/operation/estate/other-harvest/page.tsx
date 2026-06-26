import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { OtherHarvestForm } from "./components/other-harvest-form";
import { otherHarvestFormDefaults } from "./components/other-harvest-schema";
import { loadOtherHarvestOptions } from "./components/other-harvest-options";

export const metadata: Metadata = {
  title: "New Other Harvest | Zento",
  description: "Add a new other harvest record",
};

export default async function OperationEstateOtherHarvestPage() {
  const { estateOptions, supplierOptions, cropOptions } =
    await loadOtherHarvestOptions();

  return (
    <div>
      <PageBreadcrumb pageTitle="New Other Harvest" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <OtherHarvestForm
          mode="create"
          defaultValues={otherHarvestFormDefaults}
          estateOptions={estateOptions}
          supplierOptions={supplierOptions}
          cropOptions={cropOptions}
        />
      </div>
    </div>
  );
}
