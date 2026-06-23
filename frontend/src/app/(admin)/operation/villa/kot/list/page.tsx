import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listKots } from "@/lib/kot-service";
import type { Kot } from "@/types/kot";
import { KotListScreen } from "../components/kot-list";

export const metadata: Metadata = {
  title: "KOT | Zento",
  description: "Zento kitchen order tickets",
};

export default async function OperationVillaKotListPage() {
  let initialKots: Kot[] = [];
  let error: string | null = null;
  try {
    initialKots = await listKots();
  } catch {
    error = "Failed to load KOTs.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="KOT" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <KotListScreen initialKots={initialKots} error={error} />
      </div>
    </div>
  );
}
