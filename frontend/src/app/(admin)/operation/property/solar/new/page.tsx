import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listAssets } from "@/lib/asset-service";
import { SoloarForm } from "../components/soloar-form";
import { soloarFormDefaults } from "../components/soloar-schema";

export const metadata: Metadata = {
  title: "New Solar | Zento",
  description: "Add a new solar meter reading",
};

export default async function NewSoloarPage() {
  const assets = await listAssets().catch(() => []);
  // "Soloar" references a Solar-type asset (type 4).
  const soloarOptions: Option[] = assets
    .filter((a) => a.type === 4)
    .map((a) => ({ label: a.name, value: String(a.id) }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Solar" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <SoloarForm
          mode="create"
          defaultValues={soloarFormDefaults}
          soloarOptions={soloarOptions}
        />
      </div>
    </div>
  );
}
