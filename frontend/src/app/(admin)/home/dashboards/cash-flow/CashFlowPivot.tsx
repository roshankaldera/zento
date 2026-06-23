"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { CashFlowReportRow } from "@/types/cash-flow-report";
import "@webdatarocks/webdatarocks/webdatarocks.css";

// WebDataRocks touches the DOM/`window` at module load and during render, so it
// must never run during SSR. Loading the Pivot via a client-only dynamic import
// (ssr: false) is allowed here because this file is a Client Component.
const Pivot = dynamic(
  () => import("@webdatarocks/react-webdatarocks").then((m) => m.Pivot),
  { ssr: false }
);

interface CashFlowPivotProps {
  rows: CashFlowReportRow[];
}

export default function CashFlowPivot({ rows }: CashFlowPivotProps) {
  console.log("CashFlowPivot rows:", rows);

  const report = useMemo(
    () => ({
      dataSource: {
        // The first data element is a field-type map, NOT a record. In
        // WebDataRocks JSON format this object declares EVERY field the grid
        // should recognise — any field omitted here is ignored, which is why a
        // partial map collapsed the report to a single grand-total cell. List
        // all fields, typing `date` as a date (Year/Month/Day drill-down) and
        // `amount` as a number; the real rows follow.
        data: [
          {
            source: { type: "string" },
            date: { type: "date" },
            business: { type: "string" },
            bank: { type: "string" },
            account: { type: "string" },
            category: { type: "string" },
            type: { type: "string" },
            amount: { type: "number" },
          },
          ...rows,
        ],
      },
      slice: {
        // Hierarchical rows give expand/collapse drill-down:
        // Business -> Bank -> Account, split into Income / Expense columns.
        rows: [
          { uniqueName: "business" },
          { uniqueName: "bank" },
          { uniqueName: "account" },
        ],
        columns: [
          { uniqueName: "type" },
          { uniqueName: "[Measures]" },
        ],
        measures: [
          { uniqueName: "amount", aggregation: "sum", format: "currency" },
        ],
        expands: { expandAll: false },
      },
      formats: [
        {
          name: "currency",
          thousandsSeparator: ",",
          decimalPlaces: 2,
          currencySymbol: "",
        },
      ],
      options: { grid: { type: "compact", showTotals: "on", showGrandTotals: "on" } },
    }),
    [rows]
  );

  return <Pivot toolbar={true} width="100%" report={report} />;
}
