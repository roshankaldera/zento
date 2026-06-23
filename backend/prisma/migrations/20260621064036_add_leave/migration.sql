-- CreateTable
CREATE TABLE "leave" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "period" SMALLINT NOT NULL,
    "reason" VARCHAR(100),

    CONSTRAINT "leave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leave_employee_id_date_key" ON "leave"("employee_id", "date");

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
