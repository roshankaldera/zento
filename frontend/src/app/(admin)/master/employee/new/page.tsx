import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listBusinesses } from "@/lib/business-service";
import { EmployeeForm } from "../components/employee-form";
import { employeeFormDefaults } from "../components/employee-schema";

export const metadata: Metadata = {
  title: "New Employee | Zento",
  description: "Add a new employee",
};

// Fetch the business list on the server to populate the FK select.
export default async function NewEmployeePage() {
  const businesses = await listBusinesses().catch(() => []);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Employee" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <EmployeeForm
          mode="create"
          defaultValues={employeeFormDefaults}
          businessOptions={businessOptions}
        />
      </div>
    </div>
  );
}
