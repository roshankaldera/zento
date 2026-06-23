-- CreateTable
CREATE TABLE "bank" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "type" SMALLINT NOT NULL,
    "bank" VARCHAR(20) NOT NULL,
    "branch" VARCHAR(20),
    "account_no" VARCHAR(20),
    "cash_float" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "bank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank" ADD CONSTRAINT "bank_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
