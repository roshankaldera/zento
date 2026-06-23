import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listLeaves } from "@/lib/leave-service";
import type { Leave } from "@/types/leave";
import { LeaveListScreen } from "../components/leave-list";

export const metadata: Metadata = {
  title: "Leave | Zento",
  description: "Zento employee leave records",
};

export default async function OperationEmployeeLeaveListPage() {
  let initialLeaves: Leave[] = [];
  let error: string | null = null;
  try {
    initialLeaves = await listLeaves();
  } catch {
    error = "Failed to load leaves.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Leave" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <LeaveListScreen initialLeaves={initialLeaves} error={error} />
      </div>
    </div>
  );
}
