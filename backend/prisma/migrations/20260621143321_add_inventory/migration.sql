-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "applicable_businesses" INTEGER[],
    "name" VARCHAR(100) NOT NULL,
    "uom" SMALLINT NOT NULL DEFAULT 1,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stock" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "quantity" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "avg_cost" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "inventory_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_name_key" ON "inventory"("name");

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
