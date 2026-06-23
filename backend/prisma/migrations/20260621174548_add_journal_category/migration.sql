-- CreateTable
CREATE TABLE "journal_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "remark" VARCHAR(50),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "journal_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "journal_category_name_key" ON "journal_category"("name");
