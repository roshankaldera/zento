"use client"

import * as React from "react"

import ConfirmDialog, { type ConfirmOptions } from "./ConfirmDialog"

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<ConfirmFn | null>(null)

/**
 * Provides the imperative `useConfirm()` hook. Mounts a single shared
 * ConfirmDialog and resolves the promise returned by `confirm()` with the
 * user's choice. Wire once near the root of the authenticated tree.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null)
  const resolverRef = React.useRef<((result: boolean) => void) | null>(null)

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setOptions(opts)
    })
  }, [])

  const settle = React.useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOptions(null)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={options !== null}
        // Cancel button, Esc, or overlay click all close → resolve false.
        onOpenChange={(open) => {
          if (!open) settle(false)
        }}
        onConfirm={() => settle(true)}
        title={options?.title ?? ""}
        description={options?.description}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      />
    </ConfirmContext.Provider>
  )
}

/**
 * Returns an async `confirm(options)` that opens the shared dialog and resolves
 * to `true` (confirmed) or `false` (cancelled/dismissed).
 *
 * @example
 * const confirm = useConfirm()
 * if (await confirm({ title: "Save journal?", confirmLabel: "Save" })) {
 *   await save()
 * }
 */
export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm must be used within a <ConfirmProvider>")
  }
  return ctx
}
