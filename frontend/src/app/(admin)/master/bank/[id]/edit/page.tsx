import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import type { Option } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/lib/business-service";
import { getBank } from "@/lib/bank-service";
import { BankForm } from "../../components/bank-form";
import { toBankFormValues } from "../../components/bank-schema";
import { BANK_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Bank | Zento",
  description: "Update an existing bank",
};

// Fetch the record + business options on the server so the form pre-fills on
// first paint — no client fetch-on-mount and no skeleton flash.
export default async function EditBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bank, businesses] = await Promise.all([
    Number.isFinite(Number(id)) ? getBank(Number(id)) : undefined,
    listBusinesses().catch(() => []),
  ]);
  const businessOptions: Option[] = businesses.map((b) => ({
    label: b.name,
    value: String(b.id),
  }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Bank" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {bank ? (
          <BankForm
            mode="edit"
            bankId={bank.id}
            defaultValues={toBankFormValues(bank)}
            businessOptions={businessOptions}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This bank could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={BANK_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
