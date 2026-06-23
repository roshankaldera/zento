-- CreateTable
CREATE TABLE "inventory_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "remark" VARCHAR(50),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "inventory_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_group_name_key" ON "inventory_group"("name");
