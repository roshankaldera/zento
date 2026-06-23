-- CreateTable
CREATE TABLE "supplier" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "contact_person" VARCHAR(100),
    "contact_no" VARCHAR(10),
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supplier_name_key" ON "supplier"("name");
