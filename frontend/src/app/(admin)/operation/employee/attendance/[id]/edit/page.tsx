import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { getAttendance } from "@/lib/attendance-service";
import { listBusinesses } from "@/lib/business-service";
import { listEmployees } from "@/lib/employee-service";
import { AttendanceForm } from "../../components/attendance-form";
import {
  toAttendanceFormValues,
  type AttendanceEmployeeOption,
} from "../../components/attendance-schema";
import { ATTENDANCE_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Attendance | Zento",
  description: "Update an existing attendance record",
};

export default async function EditAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [attendance, businesses, employees] = await Promise.all([
    Number.isFinite(Number(id)) ? getAttendance(Number(id)) : undefined,
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
      <PageBreadcrumb pageTitle="Edit Attendance" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {attendance ? (
          <AttendanceForm
            mode="edit"
            attendanceId={attendance.id}
            defaultValues={toAttendanceFormValues(attendance)}
            businessOptions={businessOptions}
            employees={employeeOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This attendance record could not be found. It may have been
              deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={ATTENDANCE_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
