-- CreateTable
CREATE TABLE "kot" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "request_time" TIMESTAMP(3) NOT NULL,
    "remark" VARCHAR(500),

    CONSTRAINT "kot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kot_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "item" VARCHAR(100) NOT NULL,
    "quantity" DECIMAL(18,2) NOT NULL,
    "remark" VARCHAR(100),

    CONSTRAINT "kot_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "kot" ADD CONSTRAINT "kot_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kot" ADD CONSTRAINT "kot_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kot_line" ADD CONSTRAINT "kot_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "kot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
