-- CreateTable
CREATE TABLE "journal" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "voucher_no" VARCHAR(20) NOT NULL,
    "category" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "remark" VARCHAR(100),
    "post_by" INTEGER NOT NULL,
    "post_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "type" SMALLINT NOT NULL,
    "description" VARCHAR(100),
    "reference" VARCHAR(100),
    "asset_id" INTEGER,
    "emp_id" INTEGER,
    "supplier_id" INTEGER,
    "value" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "journal_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "journal" ADD CONSTRAINT "journal_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal" ADD CONSTRAINT "journal_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal" ADD CONSTRAINT "journal_category_fkey" FOREIGN KEY ("category") REFERENCES "journal_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
