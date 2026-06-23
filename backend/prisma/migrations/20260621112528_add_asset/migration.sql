-- CreateTable
CREATE TABLE "asset" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "remark" VARCHAR(100),

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_name_key" ON "asset"("name");
