"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  RHFForm,
  RHFInput,
  RHFSelect,
  RHFTextarea,
} from "@/components/hook-form"
import {
  createBusiness,
  DuplicateBusinessNameError,
  updateBusiness,
} from "@/lib/business-service"
import {
  businessSchema,
  emptyBusinessLine,
  ESTATE_TYPE,
  lineTableLabel,
  statusOptions,
  toBusinessInput,
  typeOptions,
  VILLA_TYPE,
  type BusinessFormValues,
} from "./business-schema"
import { BUSINESS_LIST_PATH } from "./constants"

interface BusinessFormProps {
  mode: "create" | "edit"
  businessId?: number
  defaultValues: BusinessFormValues
}

/**
 * Shared create/edit form for a Business. When `type` is Estate or Villa, an
 * editable child-line table appears (Estate Divisions / Villa Rooms); the same
 * `lines` field array drives both since they share a structure, and it is routed
 * to the matching payload array on submit.
 */
export function BusinessForm({
  mode,
  businessId,
  defaultValues,
}: BusinessFormProps) {
  const router = useRouter()

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    mode: "onBlur",
    defaultValues,
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const type = useWatch({ control: form.control, name: "type" })
  const showLines = type === ESTATE_TYPE || type === VILLA_TYPE

  // Changing the type starts the line table fresh (an Estate's divisions are not
  // a Villa's rooms). Skips the initial mount so loaded lines are preserved.
  const prevTypeRef = React.useRef(defaultValues.type)
  React.useEffect(() => {
    if (prevTypeRef.current === type) return
    prevTypeRef.current = type
    replace([])
  }, [type, replace])

  const onSubmit = React.useCallback(
    async (values: BusinessFormValues) => {
      // Names are unique per business — flag duplicates inline before submit.
      if (values.type === ESTATE_TYPE || values.type === VILLA_TYPE) {
        const seen = new Map<string, number>()
        let duplicate = false
        values.lines.forEach((line, index) => {
          const key = line.name.trim()
          if (!key) return
          if (seen.has(key)) {
            duplicate = true
            form.setError(`lines.${index}.name`, {
              type: "manual",
              message: "Duplicate name",
            })
          } else {
            seen.set(key, index)
          }
        })
        if (duplicate) return
      }

      const input = toBusinessInput(values)
      try {
        if (mode === "edit" && businessId != null) {
          await updateBusiness(businessId, input)
          toast.success("Business updated.")
        } else {
          await createBusiness(input)
          toast.success("Business created.")
        }
        router.push(BUSINESS_LIST_PATH)
        router.refresh()
      } catch (error) {
        if (error instanceof DuplicateBusinessNameError) {
          // The 409 may come from the business name or a child line name.
          if (/division|room/i.test(error.message)) {
            form.setError("root", {
              type: "manual",
              message: "A division/room with this name already exists.",
            })
          } else {
            form.setError("name", {
              type: "manual",
              message: "A business with this name already exists",
            })
          }
          return
        }
        form.setError("root", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
      }
    },
    [mode, businessId, router, form],
  )

  const rootError = form.formState.errors.root?.message
  const submitting = form.formState.isSubmitting

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="grid gap-5">
      <div className="grid max-w-xl gap-5">
        <RHFInput<BusinessFormValues>
          name="name"
          label="Name"
          required
          placeholder="Enter business name"
          maxLength={100}
        />
        <RHFSelect<BusinessFormValues>
          name="type"
          label="Type"
          required
          options={typeOptions}
          triggerClassName="w-full sm:w-60"
        />
        <RHFInput<BusinessFormValues>
          name="contactPerson"
          label="Contact Person"
          placeholder="Optional contact person"
          maxLength={100}
        />
        <RHFTextarea<BusinessFormValues>
          name="remark"
          label="Remark"
          placeholder="Optional notes"
          maxLength={100}
        />
        <RHFSelect<BusinessFormValues>
          name="status"
          label="Status"
          required
          options={statusOptions}
          triggerClassName="w-full sm:w-60"
        />
      </div>

      <hr></hr>

      {showLines && (
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-large text-foreground">
              {lineTableLabel(type)}
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ ...emptyBusinessLine })}
            >
              Add
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-muted-foreground dark:border-gray-800">
              No {lineTableLabel(type).toLowerCase()} yet. Click Add to enter one.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-muted-foreground dark:border-gray-800">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Remark</th>
                    <th className="w-40 px-3 py-2 font-medium">Status</th>
                    <th className="w-24 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr
                      key={field.id}
                      className="border-b border-gray-100 align-top last:border-0 dark:border-gray-800/60"
                    >
                      <td className="px-3 py-2">
                        <RHFInput<BusinessFormValues>
                          name={`lines.${index}.name`}
                          placeholder="Name"
                          maxLength={50}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <RHFInput<BusinessFormValues>
                          name={`lines.${index}.remark`}
                          placeholder="Optional"
                          maxLength={50}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <RHFSelect<BusinessFormValues>
                          name={`lines.${index}.status`}
                          options={statusOptions}
                          triggerClassName="w-full"
                        />
                      </td>
                      <td className="px-1 py-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          aria-label="Remove"
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {rootError && (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      )}

      <hr></hr>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push(BUSINESS_LIST_PATH)}
        >
          Cancel
        </Button>
      </div>
    </RHFForm>
  )
}
