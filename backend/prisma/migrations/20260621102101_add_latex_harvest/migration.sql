-- CreateTable
CREATE TABLE "latex_harvest" (
    "id" SERIAL NOT NULL,
    "estate_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "rainfall" DECIMAL(18,2),
    "remark" VARCHAR(100),

    CONSTRAINT "latex_harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "latex_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "liter" DECIMAL(18,2) NOT NULL,
    "ottapalu" DECIMAL(18,2) NOT NULL,
    "status" SMALLINT NOT NULL,

    CONSTRAINT "latex_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "latex_harvest_estate_id_date_key" ON "latex_harvest"("estate_id", "date");

-- AddForeignKey
ALTER TABLE "latex_harvest" ADD CONSTRAINT "latex_harvest_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latex_line" ADD CONSTRAINT "latex_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "latex_harvest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "latex_line" ADD CONSTRAINT "latex_line_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
