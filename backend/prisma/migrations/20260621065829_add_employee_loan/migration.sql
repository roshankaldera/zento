-- CreateTable
CREATE TABLE "employee_loan" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "issue_date" DATE,
    "value" DECIMAL(18,2) NOT NULL,
    "installment" DECIMAL(18,2) NOT NULL,
    "due_day" INTEGER NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "employee_loan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employee_loan" ADD CONSTRAINT "employee_loan_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
