-- CreateTable
CREATE TABLE "CompanyItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyItem_companyId_createdAt_idx" ON "CompanyItem"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyItem_companyId_codigo_key" ON "CompanyItem"("companyId", "codigo");

-- AddForeignKey
ALTER TABLE "CompanyItem" ADD CONSTRAINT "CompanyItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
