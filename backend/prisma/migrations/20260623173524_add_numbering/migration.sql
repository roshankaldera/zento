-- CreateTable
CREATE TABLE "numbering" (
    "prefix" VARCHAR(10) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "current_no" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "numbering_pkey" PRIMARY KEY ("prefix")
);

-- Seed the document-number sequences (one row per module).
INSERT INTO "numbering" ("prefix", "module", "current_no") VALUES
    ('JNL', 'Journal', 1),
    ('CTR', 'Cash Transfer', 1),
    ('RMB', 'Reimbursement', 1),
    ('BKN', 'Booking', 1);
