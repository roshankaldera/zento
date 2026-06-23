"use client"

import { AlertCircleIcon, InboxIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

interface DataTableLoadingProps {
  /** Number of skeleton rows to render. Defaults to the page size. */
  rows?: number
  /** Number of columns (drives skeleton cells). */
  columns: number
}

/** Skeleton rows shown while data is loading. */
export function DataTableLoading({ rows = 8, columns }: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-5" : "w-[60%] max-w-40"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

interface DataTableMessageRowProps {
  columns: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  className?: string
}

/** Generic full-width body message (used by empty + error states). */
function DataTableMessageRow({
  columns,
  icon: Icon,
  title,
  description,
  className,
}: DataTableMessageRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns} className="h-48">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 text-center",
            className
          )}
        >
          <Icon className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="max-w-sm text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function DataTableEmpty({
  columns,
  message = "No records found.",
}: {
  columns: number
  message?: string
}) {
  return (
    <DataTableMessageRow
      columns={columns}
      icon={InboxIcon}
      title="Nothing here yet"
      description={message}
    />
  )
}

export function DataTableError({
  columns,
  message = "Something went wrong while loading data.",
}: {
  columns: number
  message?: string
}) {
  return (
    <DataTableMessageRow
      columns={columns}
      icon={AlertCircleIcon}
      title="Failed to load"
      description={message}
      className="text-destructive [&_svg]:text-destructive/70"
    />
  )
}
