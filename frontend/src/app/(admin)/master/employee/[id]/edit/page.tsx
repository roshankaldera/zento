import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/lib/business-service";
import { getEmployee } from "@/lib/employee-service";
import { EmployeeForm } from "../../components/employee-form";
import { toEmployeeFormValues } from "../../components/employee-schema";
import { EMPLOYEE_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Employee | Zento",
  description: "Update an existing employee",
};

// Fetch the record + business options on the server so the form pre-fills on
// first paint — no client fetch-on-mount and no skeleton flash.
export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getEmployee(Number(id)) : undefined,
    listBusinesses().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Employee" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {employee ? (
          <EmployeeForm
            mode="edit"
            employeeId={employee.id}
            defaultValues={toEmployeeFormValues(employee)}
            businessOptions={businessOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This employee could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={EMPLOYEE_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
