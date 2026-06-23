-- CreateTable
CREATE TABLE "coconut_harvest" (
    "id" SERIAL NOT NULL,
    "estate_id" INTEGER NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(100),

    CONSTRAINT "coconut_harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coconut_division_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "division_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "coconut_division_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coconut_harvest_estate_id_date_key" ON "coconut_harvest"("estate_id", "date");

-- AddForeignKey
ALTER TABLE "coconut_harvest" ADD CONSTRAINT "coconut_harvest_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coconut_division_line" ADD CONSTRAINT "coconut_division_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "coconut_harvest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coconut_division_line" ADD CONSTRAINT "coconut_division_line_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "estate_division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
