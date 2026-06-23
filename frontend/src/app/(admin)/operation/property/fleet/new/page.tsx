import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import { FleetForm } from "../components/fleet-form";
import { fleetFormDefaults } from "../components/fleet-schema";

export const metadata: Metadata = {
  title: "New Fleet | Zento",
  description: "Add a new fleet vehicle",
};

export default function NewFleetPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New Fleet" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <FleetForm mode="create" defaultValues={fleetFormDefaults} />
      </div>
    </div>
  );
}
