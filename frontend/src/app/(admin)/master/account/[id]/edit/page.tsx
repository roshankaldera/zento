import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listAccountCategories } from "@/lib/account-category-service";
import { getAccount } from "@/lib/account-service";
import { listBusinesses } from "@/lib/business-service";
import { AccountForm } from "../../components/account-form";
import { toAccountFormValues } from "../../components/account-schema";
import { ACCOUNT_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Account | Zento",
  description: "Update an existing account",
};

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [account, groups, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getAccount(Number(id)) : undefined,
    listAccountCategories().catch(() => []),
    listBusinesses().catch(() => []),
  ]);
  const groupOptions: Option[] = groups.map((g) => ({
    label: g.name,
    value: String(g.id),
  }));
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Account" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {account ? (
          <AccountForm
            mode="edit"
            accountId={account.id}
            defaultValues={toAccountFormValues(account)}
            businessOptions={businessOptions}
            groupOptions={groupOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This account could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={ACCOUNT_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
