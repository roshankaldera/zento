import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getCrop } from "@/lib/crop-service";
import { CropForm } from "../../components/crop-form";
import { toCropFormValues } from "../../components/crop-schema";
import { CROP_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Crop | Zento",
  description: "Update an existing crop",
};

// Fetch the crop on the server so the form pre-fills on first paint — no client
// fetch-on-mount and no skeleton flash.
export default async function EditCropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const crop = Number.isFinite(Number(id))
    ? await getCrop(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Crop" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {crop ? (
          <CropForm
            mode="edit"
            cropId={crop.id}
            defaultValues={toCropFormValues(crop)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This crop could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={CROP_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
