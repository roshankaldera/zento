import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { getFleet } from "@/lib/fleet-service";
import { FleetForm } from "../../components/fleet-form";
import { toFleetFormValues } from "../../components/fleet-schema";
import { FLEET_LIST_PATH } from "../../components/constants";

export const metadata: Metadata = {
  title: "Edit Fleet | Zento",
  description: "Update an existing fleet vehicle",
};

export default async function EditFleetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fleet = Number.isFinite(Number(id))
    ? await getFleet(Number(id))
    : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Fleet" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {fleet ? (
          <FleetForm
            mode="edit"
            fleetId={fleet.id}
            defaultValues={toFleetFormValues(fleet)}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              This fleet record could not be found. It may have been deleted.
            </p>
            <Button asChild variant="outline">
              <Link href={FLEET_LIST_PATH}>Back to list</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
