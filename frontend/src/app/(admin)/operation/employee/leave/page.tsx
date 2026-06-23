import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listEmployees } from "@/lib/employee-service";
import { LeaveForm } from "./components/leave-form";
import { leaveFormDefaults } from "./components/leave-schema";

export const metadata: Metadata = {
  title: "New Leave | Zento",
  description: "Add a new leave record",
};

export default async function OperationEmployeeLeavePage() {
  const employees = await listEmployees().catch(() => []);
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Leave" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <LeaveForm
          mode="create"
          defaultValues={leaveFormDefaults}
          employeeOptions={employeeOptions}
        />
      </div>
    </div>
  );
}
