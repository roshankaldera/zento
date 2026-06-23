-- CreateTable
CREATE TABLE "soloar" (
    "id" SERIAL NOT NULL,
    "soloar_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "meter_reading" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "soloar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "soloar" ADD CONSTRAINT "soloar_soloar_id_fkey" FOREIGN KEY ("soloar_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
