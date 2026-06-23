-- CreateTable
CREATE TABLE "kot_ingredient" (
    "id" SERIAL NOT NULL,
    "kot_ids" INTEGER[],
    "date" DATE NOT NULL,
    "remark" VARCHAR(100),

    CONSTRAINT "kot_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kot_ingredient_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "item" VARCHAR(100) NOT NULL,
    "uom" SMALLINT NOT NULL DEFAULT 1,
    "request_quantity" DECIMAL(18,2) NOT NULL,
    "received_quantity" DECIMAL(18,2) NOT NULL,
    "remark" VARCHAR(100),

    CONSTRAINT "kot_ingredient_line_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "kot_ingredient_line" ADD CONSTRAINT "kot_ingredient_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "kot_ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
