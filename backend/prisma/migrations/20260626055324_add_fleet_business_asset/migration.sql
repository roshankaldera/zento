/*
  Warnings:

  - Added the required column `asset_id` to the `fleet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business_id` to the `fleet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fleet" ADD COLUMN     "asset_id" INTEGER NOT NULL,
ADD COLUMN     "business_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "fleet" ADD CONSTRAINT "fleet_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet" ADD CONSTRAINT "fleet_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
