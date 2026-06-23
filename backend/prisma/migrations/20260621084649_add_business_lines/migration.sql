-- CreateTable
CREATE TABLE "estate_division" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "remark" VARCHAR(50),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "estate_division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villa_room" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "remark" VARCHAR(50),
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "villa_room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estate_division_business_id_name_key" ON "estate_division"("business_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "villa_room_business_id_name_key" ON "villa_room"("business_id", "name");

-- AddForeignKey
ALTER TABLE "estate_division" ADD CONSTRAINT "estate_division_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villa_room" ADD CONSTRAINT "villa_room_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
