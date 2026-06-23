-- CreateTable
CREATE TABLE "crop" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "remark" VARCHAR(50),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "crop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crop_name_key" ON "crop"("name");
