import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { getCashFlowReport } from "@/lib/cash-flow-report-service";
import type { CashFlowReportRow } from "@/types/cash-flow-report";
import CashFlowPivot from "./CashFlowPivot";

export const metadata: Metadata = {
  title: "Cash Flow | Zento",
  description: "Zento Cash Flow page",
};

export default async function HomeDashboardsCashFlowPage() {
  let rows: CashFlowReportRow[] = [];
  let loadError: string | null = null;

  try {
    rows = await getCashFlowReport();
  } catch {
    loadError =
      "Could not load cash-flow data. Is the API running on " +
      (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001") +
      "?";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Cash Flow" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {loadError ? (
          <p className="text-theme-sm text-error-500">{loadError}</p>
        ) : (
          <CashFlowPivot rows={rows} />
        )}
      </div>
    </div>
  );
}
