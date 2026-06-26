import Notifications from "@/components/notification/Notifications";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Notification | Zento",
  description: "Zento Notification page",
};

export default function NotificationPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Notification" />
      <Notifications />
    </div>
  );
}
