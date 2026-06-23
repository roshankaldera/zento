import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listAttendances } from "@/lib/attendance-service";
import type { Attendance } from "@/types/attendance";
import { AttendanceListScreen } from "../components/attendance-list";

export const metadata: Metadata = {
  title: "Attendance | Zento",
  description: "Zento attendance records",
};

export default async function OperationEmployeeAttendanceListPage() {
  let initialAttendances: Attendance[] = [];
  let error: string | null = null;
  try {
    initialAttendances = await listAttendances();
  } catch {
    error = "Failed to load attendance records.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Attendance" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AttendanceListScreen
          initialAttendances={initialAttendances}
          error={error}
        />
      </div>
    </div>
  );
}
