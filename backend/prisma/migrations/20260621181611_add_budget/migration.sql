-- CreateTable
CREATE TABLE "budget" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_line" (
    "id" SERIAL NOT NULL,
    "main_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "description" VARCHAR(100),
    "january" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "february" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "march" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "april" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "may" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "june" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "july" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "august" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "september" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "october" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "november" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "december" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "budget_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_business_id_year_key" ON "budget"("business_id", "year");

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_main_id_fkey" FOREIGN KEY ("main_id") REFERENCES "budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_line" ADD CONSTRAINT "budget_line_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
