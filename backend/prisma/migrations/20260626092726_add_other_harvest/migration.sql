-- CreateTable
CREATE TABLE "other_harvest" (
    "id" SERIAL NOT NULL,
    "estate_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "crop_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "quantity" DECIMAL(18,2) NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "reference" VARCHAR(100),
    "remark" VARCHAR(100),

    CONSTRAINT "other_harvest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "other_harvest" ADD CONSTRAINT "other_harvest_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_harvest" ADD CONSTRAINT "other_harvest_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_harvest" ADD CONSTRAINT "other_harvest_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
