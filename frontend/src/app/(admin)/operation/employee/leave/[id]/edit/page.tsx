import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listEmployees } from "@/lib/employee-service";
import { getLeave } from "@/lib/leave-service";
import { LeaveForm } from "../../components/leave-form";
import { toLeaveFormValues } from "../../components/leave-schema";
import { LEAVE_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Leave | Zento",
  description: "Update an existing leave record",
};

export default async function EditLeavePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [leave, employees] = await Promise.all([
    Number.isFinite(Number(id)) ? getLeave(Number(id)) : undefined,
    listEmployees().catch(() => []),
  ]);
  const employeeOptions: Option[] = employees.map((e) => ({
    label: `${e.empNo} — ${e.name}`,
    value: String(e.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Leave" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {leave ? (
          <LeaveForm
            mode="edit"
            leaveId={leave.id}
            defaultValues={toLeaveFormValues(leave)}
            employeeOptions={employeeOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This leave could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={LEAVE_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
