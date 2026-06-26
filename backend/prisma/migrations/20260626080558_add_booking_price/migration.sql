-- CreateTable
CREATE TABLE "booking_price_list" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "remark" VARCHAR(100),

    CONSTRAINT "booking_price_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_price_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "ota_price" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "direct_price" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "dmc_price" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "local_price" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "booking_price_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking_price_list" ADD CONSTRAINT "booking_price_list_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_price_line" ADD CONSTRAINT "booking_price_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "booking_price_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;
