import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import type { Option } from "@/components/hook-form";
import { listEmployees } from "@/lib/employee-service";
import { EmployeeLoanForm } from "./components/employee-loan-form";
import { employeeLoanFormDefaults } from "./components/employee-loan-schema";

export const metadata: Metadata = {
  title: "New Loan | Zento",
  description: "Add a new employee loan",
};

export default async function OperationEmployeeLoanPage() {
  const employees = await listEmployees().catch(() => []);
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="New Loan" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <EmployeeLoanForm
          mode="create"
          defaultValues={employeeLoanFormDefaults}
          employeeOptions={employeeOptions}
        />
      </div>
    </div>
  );
}
