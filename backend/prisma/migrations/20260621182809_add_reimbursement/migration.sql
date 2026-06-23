-- CreateTable
CREATE TABLE "reimbursement" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "reimburse_no" VARCHAR(20) NOT NULL,
    "date" DATE NOT NULL,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "remark" VARCHAR(100),
    "post_by" INTEGER NOT NULL,
    "post_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reimbursement_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "bill_date" DATE,
    "description" VARCHAR(100),
    "reference" VARCHAR(100),
    "value" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "reimbursement_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement_line" ADD CONSTRAINT "reimbursement_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "reimbursement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
