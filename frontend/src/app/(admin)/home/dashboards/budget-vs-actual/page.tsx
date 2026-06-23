import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Budget vs Actual | Zento",
  description: "Zento Budget vs Actual page",
};

export default function HomeDashboardsBudgetVsActualPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Budget vs Actual" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Budget vs Actual
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            This is the Budget vs Actual page of Zento. Start building your content here.
          </p>
        </div>
      </div>
    </div>
  );
}
