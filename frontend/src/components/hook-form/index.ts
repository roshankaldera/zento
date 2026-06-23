/**
 * Reusable React Hook Form component library.
 *
 * Every field reads the form via `useFormContext()` (no `control` prop), renders
 * its label/description/error through the shared `RHFField` chrome, and commits
 * domain-typed values (number, Date, File, etc.) ready for Zod validation.
 *
 * @example
 * const form = useForm<Schema>({ resolver: zodResolver(schema) })
 * return (
 *   <RHFForm form={form} onSubmit={onSubmit} className="grid gap-4">
 *     <RHFInput<Schema> name="firstName" label="First name" required />
 *     <RHFSelect<Schema> name="role" label="Role" options={roleOptions} />
 *     <Button type="submit">Save</Button>
 *   </RHFForm>
 * )
 */

// Core / architecture
export { RHFForm, type RHFFormProps } from "./rhf-form"
export {
  RHFField,
  type RHFFieldProps,
  type RHFFieldRenderArgs,
} from "./rhf-field"

// Shared contracts & helpers
export type {
  BaseFieldProps,
  Option,
  OptionGroup,
  FieldPath,
  FieldValues,
} from "./types"
export {
  isOption,
  normalizeOptions,
  findOption,
  formatBytes,
  validateFile,
  toArray,
  type FileValidationOptions,
} from "./utils"

// Basic inputs
export { RHFInput, type RHFInputProps } from "./rhf-input"
export { RHFTextarea, type RHFTextareaProps } from "./rhf-textarea"
export {
  RHFNumberInput,
  type RHFNumberInputProps,
} from "./rhf-number-input"
export {
  RHFPasswordInput,
  type RHFPasswordInputProps,
} from "./rhf-password-input"
export { RHFEmailInput, type RHFEmailInputProps } from "./rhf-email-input"

// Selection
export { RHFSelect, type RHFSelectProps } from "./rhf-select"
export {
  RHFMultiSelect,
  type RHFMultiSelectProps,
} from "./rhf-multi-select"
export {
  RHFAutocomplete,
  type RHFAutocompleteProps,
} from "./rhf-autocomplete"
export { RHFRadioGroup, type RHFRadioGroupProps } from "./rhf-radio-group"
export { RHFCheckbox, type RHFCheckboxProps } from "./rhf-checkbox"
export { RHFSwitch, type RHFSwitchProps } from "./rhf-switch"

// Date & time
export { RHFDatePicker, type RHFDatePickerProps } from "./rhf-date-picker"
export {
  RHFDateRangePicker,
  type RHFDateRangePickerProps,
} from "./rhf-date-range-picker"
export { RHFTimePicker, type RHFTimePickerProps } from "./rhf-time-picker"

// Advanced
export {
  RHFCurrencyInput,
  type RHFCurrencyInputProps,
} from "./rhf-currency-input"
export {
  RHFPercentageInput,
  type RHFPercentageInputProps,
} from "./rhf-percentage-input"
export { RHFFileUpload, type RHFFileUploadProps } from "./rhf-file-upload"
export { RHFImageUpload, type RHFImageUploadProps } from "./rhf-image-upload"
