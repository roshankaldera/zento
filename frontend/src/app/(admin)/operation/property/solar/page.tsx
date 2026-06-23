import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listSoloars } from "@/lib/soloar-service";
import type { Soloar } from "@/types/soloar";
import { SoloarListScreen } from "./components/soloar-list";

export const metadata: Metadata = {
  title: "Solar | Zento",
  description: "Zento solar meter readings",
};

export default async function OperationPropertySolarPage() {
  let initialSoloars: Soloar[] = [];
  let error: string | null = null;
  try {
    initialSoloars = await listSoloars();
  } catch {
    error = "Failed to load solar readings.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Solar" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <SoloarListScreen initialSoloars={initialSoloars} error={error} />
      </div>
    </div>
  );
}
