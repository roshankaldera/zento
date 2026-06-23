import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { listEmployees } from "@/lib/employee-service";
import { AttendanceForm } from "./components/attendance-form";
import {
  attendanceFormDefaults,
  type AttendanceEmployeeOption,
} from "./components/attendance-schema";

export const metadata: Metadata = {
  title: "New Attendance | Zento",
  description: "Add a new attendance record",
};

export default async function OperationEmployeeAttendancePage() {
  const [businesses, employees] = await Promise.all([
    listBusinesses().catch(() => []),
    listEmployees().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));
  const employeeOptions: AttendanceEmployeeOption[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
    businessId: e.businessId,
    status: e.status,
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Attendance" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <AttendanceForm
          mode="create"
          defaultValues={attendanceFormDefaults}
          businessOptions={businessOptions}
          employees={employeeOptions}
        />
      </div>
    </div>
  );
}
