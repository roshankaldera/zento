import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getSupplier } from "@/lib/supplier-service";
import { SupplierForm } from "../../components/supplier-form";
import { toSupplierFormValues } from "../../components/supplier-schema";
import { SUPPLIER_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Supplier | Zento",
  description: "Update an existing supplier",
};

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = Number.isFinite(Number(id))
    ? await getSupplier(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Supplier" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {supplier ? (
          <SupplierForm
            mode="edit"
            supplierId={supplier.id}
            defaultValues={toSupplierFormValues(supplier)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This supplier could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={SUPPLIER_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
