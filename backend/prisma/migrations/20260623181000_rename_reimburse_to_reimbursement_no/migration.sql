-- Rename reimburse_no -> reimbursement_no (preserving existing data) and make
-- it nullable, since the reimbursement number is now generated server-side on
-- save.
ALTER TABLE "reimbursement" RENAME COLUMN "reimburse_no" TO "reimbursement_no";
ALTER TABLE "reimbursement" ALTER COLUMN "reimbursement_no" DROP NOT NULL;
