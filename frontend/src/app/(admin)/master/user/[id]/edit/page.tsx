import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/lib/business-service";
import { getUser } from "@/lib/user-service";
import { UserForm } from "../../components/user-form";
import { toUserFormValues } from "../../components/user-schema";
import { USER_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit User | Zento",
  description: "Update an existing user",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getUser(Number(id)) : undefined,
    listBusinesses().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit User" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {user ? (
          <UserForm
            mode="edit"
            userId={user.id}
            defaultValues={toUserFormValues(user)}
            businessOptions={businessOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This user could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={USER_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
