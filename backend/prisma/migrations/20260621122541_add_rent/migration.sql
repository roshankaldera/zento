-- CreateTable
CREATE TABLE "rent" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "tenant" VARCHAR(100) NOT NULL,
    "advanced_payment" DECIMAL(18,2) NOT NULL,
    "security_bond" DECIMAL(18,2) NOT NULL,
    "rent_value" DECIMAL(18,2) NOT NULL,
    "wht_value" DECIMAL(18,2) NOT NULL,
    "wht_certificate_collected" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "payment_day" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL,

    CONSTRAINT "rent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rent" ADD CONSTRAINT "rent_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent" ADD CONSTRAINT "rent_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
