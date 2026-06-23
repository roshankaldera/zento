-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "shift" SMALLINT NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "hours" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL,
    "remark" VARCHAR(100),

    CONSTRAINT "attendance_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_line" ADD CONSTRAINT "attendance_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_line" ADD CONSTRAINT "attendance_line_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
