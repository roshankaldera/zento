-- AlterTable: add nullable first so existing rows can be backfilled
ALTER TABLE "asset" ADD COLUMN "business_id" INTEGER;

-- Backfill existing assets with the earliest business (no business context existed before now)
UPDATE "asset"
SET "business_id" = (SELECT "id" FROM "business" ORDER BY "id" ASC LIMIT 1)
WHERE "business_id" IS NULL;

-- Enforce NOT NULL once every row has a value
ALTER TABLE "asset" ALTER COLUMN "business_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
