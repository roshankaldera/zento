-- CreateTable
CREATE TABLE "recurring" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "recurring_day" SMALLINT NOT NULL,
    "from_period" DATE,
    "to_period" DATE,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "remark" VARCHAR(100),

    CONSTRAINT "recurring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_line" (
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

    CONSTRAINT "recurring_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_category_fkey" FOREIGN KEY ("category") REFERENCES "journal_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_line" ADD CONSTRAINT "recurring_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "recurring"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_line" ADD CONSTRAINT "recurring_line_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_line" ADD CONSTRAINT "recurring_line_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_line" ADD CONSTRAINT "recurring_line_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_line" ADD CONSTRAINT "recurring_line_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
