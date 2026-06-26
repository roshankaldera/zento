import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getOtherHarvest } from "@/lib/other-harvest-service";
import { OtherHarvestForm } from "../../components/other-harvest-form";
import { toOtherHarvestFormValues } from "../../components/other-harvest-schema";
import { loadOtherHarvestOptions } from "../../components/other-harvest-options";
import { OTHER_HARVEST_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Other Harvest | Zento",
  description: "Update an existing other harvest record",
};

export default async function EditOtherHarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [otherHarvest, { estateOptions, supplierOptions, cropOptions }] =
    await Promise.all([
      Number.isFinite(Number(id)) ? getOtherHarvest(Number(id)) : undefined,
      loadOtherHarvestOptions(),
    ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Other Harvest" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {otherHarvest ? (
          <OtherHarvestForm
            mode="edit"
            otherHarvestId={otherHarvest.id}
            defaultValues={toOtherHarvestFormValues(otherHarvest)}
            estateOptions={estateOptions}
            supplierOptions={supplierOptions}
            cropOptions={cropOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This other harvest could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={OTHER_HARVEST_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
