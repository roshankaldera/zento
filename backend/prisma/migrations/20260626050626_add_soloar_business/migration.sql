/*
  Warnings:

  - Added the required column `business_id` to the `soloar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "soloar" ADD COLUMN     "business_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "soloar" ADD CONSTRAINT "soloar_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
