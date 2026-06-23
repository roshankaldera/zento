-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "emp_no" VARCHAR(20) NOT NULL,
    "nic" VARCHAR(12) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "mobile1" VARCHAR(10),
    "mobile2" VARCHAR(10),
    "address" VARCHAR(100),
    "dob" DATE,
    "attend_type" SMALLINT NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_emp_no_key" ON "employee"("emp_no");

-- CreateIndex
CREATE UNIQUE INDEX "employee_nic_key" ON "employee"("nic");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
