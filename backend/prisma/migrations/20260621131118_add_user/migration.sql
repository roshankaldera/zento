-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "default_business" INTEGER,
    "accessible_businesses" INTEGER[],
    "status" SMALLINT NOT NULL DEFAULT 1,
    "remark" VARCHAR(100),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_user_name_key" ON "user"("user_name");
