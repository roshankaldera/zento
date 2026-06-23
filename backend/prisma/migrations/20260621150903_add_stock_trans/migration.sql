-- CreateTable
CREATE TABLE "stock_trans" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "request_by" INTEGER,
    "type" SMALLINT NOT NULL,
    "total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "remark" VARCHAR(100),

    CONSTRAINT "stock_trans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_trans_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "description" VARCHAR(100),
    "quantity" DECIMAL(18,2) NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "stock_trans_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_trans" ADD CONSTRAINT "stock_trans_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_trans" ADD CONSTRAINT "stock_trans_request_by_fkey" FOREIGN KEY ("request_by") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_trans_line" ADD CONSTRAINT "stock_trans_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "stock_trans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_trans_line" ADD CONSTRAINT "stock_trans_line_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
