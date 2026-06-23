import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { listEmployees } from "@/lib/employee-service";
import { LatexHarvestForm } from "./components/latex-harvest-form";
import { latexHarvestFormDefaults } from "./components/latex-harvest-schema";

export const metadata: Metadata = {
  title: "New Latex Harvest | Zento",
  description: "Add a new latex harvest",
};

export default async function OperationEstateLatexHarvestPage() {
  const [businesses, employees] = await Promise.all([
    listBusinesses().catch(() => []),
    listEmployees().catch(() => []),
  ]);
  // Estates are businesses of type 1.
  const estateOptions: Option[] = businesses
    .filter((b) => b.type === 1)
    .map((b) => ({ label: b.name, value: String(b.id) }));
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Latex Harvest" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <LatexHarvestForm
          mode="create"
          defaultValues={latexHarvestFormDefaults}
          estateOptions={estateOptions}
          employeeOptions={employeeOptions}
        />
      </div>
    </div>
  );
}
