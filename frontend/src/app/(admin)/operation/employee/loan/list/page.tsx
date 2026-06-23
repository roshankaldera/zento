import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { listEmployeeLoans } from "@/lib/employee-loan-service";
import type { EmployeeLoan } from "@/types/employee-loan";
import { EmployeeLoanListScreen } from "../components/employee-loan-list";

export const metadata: Metadata = {
  title: "Loan | Zento",
  description: "Zento employee loan records",
};

export default async function OperationEmployeeLoanListPage() {
  let initialEmployeeLoans: EmployeeLoan[] = [];
  let error: string | null = null;
  try {
    initialEmployeeLoans = await listEmployeeLoans();
  } catch {
    error = "Failed to load employee loans.";
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Loan" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <EmployeeLoanListScreen
          initialEmployeeLoans={initialEmployeeLoans}
          error={error}
        />
      </div>
    </div>
  );
}
