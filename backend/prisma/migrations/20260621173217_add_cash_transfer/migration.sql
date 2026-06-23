-- CreateTable
CREATE TABLE "cash_transfer" (
    "id" SERIAL NOT NULL,
    "from_bank" INTEGER NOT NULL,
    "to_bank" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DECIMAL(18,2) NOT NULL,
    "description" VARCHAR(100),
    "reference" VARCHAR(100),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "post_by" INTEGER NOT NULL,
    "post_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cash_transfer" ADD CONSTRAINT "cash_transfer_from_bank_fkey" FOREIGN KEY ("from_bank") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transfer" ADD CONSTRAINT "cash_transfer_to_bank_fkey" FOREIGN KEY ("to_bank") REFERENCES "bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
