-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" SERIAL NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "rate" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_currency_id_date_key" ON "exchange_rate"("currency_id", "date");
