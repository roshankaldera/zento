-- CreateTable
CREATE TABLE "account_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "remark" VARCHAR(50),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "account_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_category_name_key" ON "account_category"("name");
