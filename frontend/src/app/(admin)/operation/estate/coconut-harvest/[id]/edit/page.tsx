import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/lib/business-service";
import { getCoconutHarvest } from "@/lib/coconut-harvest-service";
import { CoconutHarvestForm } from "../../components/coconut-harvest-form";
import { toCoconutHarvestFormValues } from "../../components/coconut-harvest-schema";
import { COCONUT_HARVEST_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Coconut Harvest | Zento",
  description: "Update an existing coconut harvest",
};

export default async function EditCoconutHarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [harvest, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getCoconutHarvest(Number(id)) : undefined,
    listBusinesses().catch(() => []),
  ]);
  const estateOptions: Option[] = businesses
    .filter((b) => b.type === 1)
    .map((b) => ({ label: b.name, value: String(b.id) }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Coconut Harvest" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {harvest ? (
          <CoconutHarvestForm
            mode="edit"
            coconutHarvestId={harvest.id}
            defaultValues={toCoconutHarvestFormValues(harvest)}
            estateOptions={estateOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This coconut harvest could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={COCONUT_HARVEST_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
