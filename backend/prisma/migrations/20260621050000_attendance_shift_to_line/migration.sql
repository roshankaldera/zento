-- Move shift from the header to the line level; add a header remark.
ALTER TABLE "attendance" DROP COLUMN "shift",
ADD COLUMN     "remark" VARCHAR(100);

-- Add per-line shift and widen hours to a decimal (so minutes can be expressed).
ALTER TABLE "attendance_line" ADD COLUMN "shift" SMALLINT NOT NULL,
ALTER COLUMN "hours" SET DATA TYPE DECIMAL(4,2);

-- One attendance header per business per date.
CREATE UNIQUE INDEX "attendance_business_id_date_key" ON "attendance"("business_id", "date");

-- An employee cannot repeat the same shift within one header.
CREATE UNIQUE INDEX "attendance_line_main_id_employee_id_shift_key" ON "attendance_line"("main_id", "employee_id", "shift");
