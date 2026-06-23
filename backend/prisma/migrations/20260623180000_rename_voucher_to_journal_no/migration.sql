-- Rename voucher_no -> journal_no (preserving existing data) and make it
-- nullable, since the journal number is now generated server-side on save.
ALTER TABLE "journal" RENAME COLUMN "voucher_no" TO "journal_no";
ALTER TABLE "journal" ALTER COLUMN "journal_no" DROP NOT NULL;
