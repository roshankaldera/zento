-- CreateTable
CREATE TABLE "business" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" SMALLINT NOT NULL,
    "contact_person" VARCHAR(100),
    "remark" VARCHAR(100),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_name_key" ON "business"("name");
