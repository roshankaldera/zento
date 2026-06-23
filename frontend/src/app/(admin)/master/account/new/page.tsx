import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import type { Option } from "@/components/hook-form";
import { listAccountCategories } from "@/lib/account-category-service";
import { listBusinesses } from "@/lib/business-service";
import { AccountForm } from "../components/account-form";
import { accountFormDefaults } from "../components/account-schema";

export const metadata: Metadata = {
  title: "New Account | Zento",
  description: "Add a new account",
};

export default async function NewAccountPage() {
  const [groups, businesses] = await Promise.all([
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
      <PageBreadcrumb pageTitle="New Account" />
      <Card className="rounded-2xl border-gray-200 bg-white py-0 shadow-none dark:border-gray-800 dark:bg-white/[0.03]">
        <CardContent className="px-5 py-7 xl:px-10 xl:py-12">
          <AccountForm
            mode="create"
            defaultValues={accountFormDefaults}
            businessOptions={businessOptions}
            groupOptions={groupOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
