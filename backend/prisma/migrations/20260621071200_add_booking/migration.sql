-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "category" SMALLINT NOT NULL,
    "room_ids" INTEGER[],
    "customer" VARCHAR(100) NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "pax" SMALLINT NOT NULL,
    "child" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL,
    "segment" SMALLINT NOT NULL,
    "currency" SMALLINT NOT NULL DEFAULT 1,
    "ex_rate" DECIMAL(18,2) NOT NULL DEFAULT 1,
    "invoice_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "vat" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "sscl" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "gross_revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "commission" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "net_revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bank_charges" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "final_revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tsc_commission" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "payout" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
