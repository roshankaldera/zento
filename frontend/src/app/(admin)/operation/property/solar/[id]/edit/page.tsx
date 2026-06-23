import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listAssets } from "@/lib/asset-service";
import { getSoloar } from "@/lib/soloar-service";
import { SoloarForm } from "../../components/soloar-form";
import { toSoloarFormValues } from "../../components/soloar-schema";
import { SOLOAR_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Solar | Zento",
  description: "Update an existing solar meter reading",
};

export default async function EditSoloarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [soloar, assets] = await Promise.all([
    Number.isFinite(Number(id)) ? getSoloar(Number(id)) : undefined,
    listAssets().catch(() => []),
  ]);
  const soloarOptions: Option[] = assets
    .filter((a) => a.type === 4)
    .map((a) => ({ label: a.name, value: String(a.id) }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Solar" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {soloar ? (
          <SoloarForm
            mode="edit"
            soloarId={soloar.id}
            defaultValues={toSoloarFormValues(soloar)}
            soloarOptions={soloarOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This solar reading could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={SOLOAR_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
