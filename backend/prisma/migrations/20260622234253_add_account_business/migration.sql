-- AlterTable: add the FK column nullable first so existing rows can be backfilled.
ALTER TABLE "account" ADD COLUMN     "business_id" INTEGER;

-- Backfill existing accounts with the earliest business so the column can be made NOT NULL.
UPDATE "account" SET "business_id" = (SELECT "id" FROM "business" ORDER BY "id" ASC LIMIT 1) WHERE "business_id" IS NULL;

-- Enforce the NOT NULL constraint now that every row has a value.
ALTER TABLE "account" ALTER COLUMN "business_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
