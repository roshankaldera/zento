import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listEmployees } from "@/lib/employee-service";
import type { Employee } from "@/types/employee";
import { EmployeeListScreen } from "./components/employee-list";

export const metadata: Metadata = {
  title: "Employee | Zento",
  description: "Zento Employee master list",
};

// Fetch the list on the server so the table paints populated on first response,
// instead of shipping JS → hydrating → fetching on the client. The page re-runs
// (and re-fetches) on every `router.refresh()` after a mutation.
export default async function MasterEmployeePage() {
  let initialEmployees: Employee[] = [];
  let error: string | null = null;
  try {
    initialEmployees = await listEmployees();
  } catch {
    error = "Failed to load employees.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Employee" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <EmployeeListScreen initialEmployees={initialEmployees} error={error} />
      </div>
    </div>
  );
}
