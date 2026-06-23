import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/lib/business-service";
import { listEmployees } from "@/lib/employee-service";
import { getLatexHarvest } from "@/lib/latex-harvest-service";
import { LatexHarvestForm } from "../../components/latex-harvest-form";
import { toLatexHarvestFormValues } from "../../components/latex-harvest-schema";
import { LATEX_HARVEST_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Latex Harvest | Zento",
  description: "Update an existing latex harvest",
};

export default async function EditLatexHarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [harvest, businesses, employees] = await Promise.all([
    Number.isFinite(Number(id)) ? getLatexHarvest(Number(id)) : undefined,
    listBusinesses().catch(() => []),
    listEmployees().catch(() => []),
  ]);
  const estateOptions: Option[] = businesses
    .filter((b) => b.type === 1)
    .map((b) => ({ label: b.name, value: String(b.id) }));
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Latex Harvest" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {harvest ? (
          <LatexHarvestForm
            mode="edit"
            latexHarvestId={harvest.id}
            defaultValues={toLatexHarvestFormValues(harvest)}
            estateOptions={estateOptions}
            employeeOptions={employeeOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This latex harvest could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={LATEX_HARVEST_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
