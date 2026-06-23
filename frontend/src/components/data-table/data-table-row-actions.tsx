"use client"

import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { RowAction } from "./types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onView?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  /** Extra items appended below the built-in actions. */
  actions?: RowAction<TData>[]
  /** Ask for confirmation before invoking `onDelete`. Defaults to true. */
  confirmDelete?: boolean
  deleteTitle?: string
  deleteDescription?: string
}

/**
 * Per-row "⋯" dropdown with View / Edit / Delete plus arbitrary custom actions.
 * Delete is gated behind an AlertDialog confirmation by default.
 */
function DataTableRowActionsInner<TData>({
  row,
  onView,
  onEdit,
  onDelete,
  actions,
  confirmDelete = true,
  deleteTitle = "Are you sure?",
  deleteDescription = "This action cannot be undone. This record will be permanently removed.",
}: DataTableRowActionsProps<TData>) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const data = row.original

  const visibleActions = (actions ?? []).filter((a) => !a.hidden?.(data))

  const handleDelete = React.useCallback(() => {
    if (!onDelete) return
    if (confirmDelete) setConfirmOpen(true)
    else onDelete(data)
  }, [onDelete, confirmDelete, data])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground data-[state=open]:bg-accent"
            aria-label="Open row actions"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {onView && (
            <DropdownMenuItem onClick={() => onView(data)}>
              <EyeIcon />
              View
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(data)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
          )}

          {visibleActions.length > 0 && (onView || onEdit) && (
            <DropdownMenuSeparator />
          )}
          {visibleActions.map((action) => {
            const Icon = action.icon
            return (
              <DropdownMenuItem
                key={action.label}
                variant={action.destructive ? "destructive" : "default"}
                disabled={action.disabled?.(data)}
                onClick={() => action.onClick(data)}
              >
                {Icon && <Icon />}
                {action.label}
              </DropdownMenuItem>
            )
          })}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => onDelete?.(data)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const DataTableRowActions = React.memo(
  DataTableRowActionsInner
) as typeof DataTableRowActionsInner
