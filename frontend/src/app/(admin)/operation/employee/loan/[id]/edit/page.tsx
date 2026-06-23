import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listEmployees } from "@/lib/employee-service";
import { getEmployeeLoan } from "@/lib/employee-loan-service";
import { EmployeeLoanForm } from "../../components/employee-loan-form";
import { toEmployeeLoanFormValues } from "../../components/employee-loan-schema";
import { EMPLOYEE_LOAN_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Loan | Zento",
  description: "Update an existing employee loan",
};

export default async function EditEmployeeLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [loan, employees] = await Promise.all([
    Number.isFinite(Number(id)) ? getEmployeeLoan(Number(id)) : undefined,
    listEmployees().catch(() => []),
  ]);
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Loan" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {loan ? (
          <EmployeeLoanForm
            mode="edit"
            employeeLoanId={loan.id}
            defaultValues={toEmployeeLoanFormValues(loan)}
            employeeOptions={employeeOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This employee loan could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={EMPLOYEE_LOAN_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
