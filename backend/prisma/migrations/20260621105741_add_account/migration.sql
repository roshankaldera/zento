-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "group_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_code_key" ON "account"("code");

-- CreateIndex
CREATE UNIQUE INDEX "account_name_key" ON "account"("name");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "account_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
