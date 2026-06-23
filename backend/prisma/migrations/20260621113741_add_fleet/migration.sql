-- CreateTable
CREATE TABLE "fleet" (
    "id" SERIAL NOT NULL,
    "vehicle_no" VARCHAR(10) NOT NULL,
    "license_date" VARCHAR(5) NOT NULL,
    "insurance_date" VARCHAR(5) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "fleet_pkey" PRIMARY KEY ("id")
);
