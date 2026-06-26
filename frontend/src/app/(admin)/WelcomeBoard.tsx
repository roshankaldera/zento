"use client";

import Link from "next/link";
import React from "react";

import { useAuth } from "@/context/AuthContext";
import {
  BoxCubeIcon,
  GridIcon,
  ListIcon,
  PieChartIcon,
} from "@/icons";

type QuickLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const quickLinks: QuickLink[] = [
  {
    title: "Dashboards",
    description: "Cash flow, budget vs. actual and profit & loss.",
    href: "/home/dashboards/cash-flow",
    icon: <GridIcon />,
  },
  {
    title: "Financial",
    description: "Journals, transfers, reimbursements and budgets.",
    href: "/financial/journal",
    icon: <ListIcon />,
  },
  {
    title: "Operation",
    description: "Employees, villa, estate, property and inventory.",
    href: "/operation/villa/booking",
    icon: <BoxCubeIcon />,
  },
  {
    title: "Masters",
    description: "Businesses, employees, accounts and sub-masters.",
    href: "/master/business",
    icon: <PieChartIcon />,
  },
];

export default function WelcomeBoard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0];

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
        <span className="text-sm font-medium text-brand-500">Welcome to Zento</span>
        <h1 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {firstName ? `Hello, ${firstName} 👋` : "Hello 👋"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          This is your back-office home. Jump into a dashboard or pick a module
          below to get started.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              {link.icon}
            </span>
            <h2 className="mt-4 font-medium text-gray-800 dark:text-white/90">
              {link.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
