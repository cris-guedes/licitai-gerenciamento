-- CreateEnum
CREATE TYPE "OportunidadeItemStatus" AS ENUM ('PENDING_MAPPING', 'PENDING_PRICING', 'READY_FOR_BID', 'IN_BIDDING', 'WON', 'LOST', 'DISCARDED');

-- AlterTable
ALTER TABLE "OportunidadeItem" ADD COLUMN     "companyItemId" TEXT,
ADD COLUMN     "isSelected" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "observacaoInterna" TEXT,
ADD COLUMN     "status" "OportunidadeItemStatus" NOT NULL DEFAULT 'PENDING_MAPPING';

-- CreateTable
CREATE TABLE "OportunidadeItemPricing" (
    "id" TEXT NOT NULL,
    "oportunidadeItemId" TEXT NOT NULL,
    "quantidadeCotada" DECIMAL(18,4),
    "quantidadeAdesao" DECIMAL(18,4),
    "precoOfertaUnitario" DECIMAL(15,2),
    "precoOfertaTotal" DECIMAL(15,2),
    "custoUnitarioSnapshot" DECIMAL(15,2),
    "valorMinimoLance" DECIMAL(15,2),
    "ofertaMarca" TEXT,
    "ofertaModelo" TEXT,
    "garantiaDescricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OportunidadeItemPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OportunidadeItemDisputa" (
    "id" TEXT NOT NULL,
    "oportunidadeItemId" TEXT NOT NULL,
    "ultimoLance" DECIMAL(15,2),
    "dataUltimoLance" TIMESTAMP(3),
    "situacaoDisputa" TEXT,
    "observacaoOperacional" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OportunidadeItemDisputa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OportunidadeItemPricing_oportunidadeItemId_key" ON "OportunidadeItemPricing"("oportunidadeItemId");

-- CreateIndex
CREATE INDEX "OportunidadeItemPricing_createdAt_idx" ON "OportunidadeItemPricing"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OportunidadeItemDisputa_oportunidadeItemId_key" ON "OportunidadeItemDisputa"("oportunidadeItemId");

-- CreateIndex
CREATE INDEX "OportunidadeItemDisputa_createdAt_idx" ON "OportunidadeItemDisputa"("createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeItem_companyItemId_createdAt_idx" ON "OportunidadeItem"("companyItemId", "createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeItem_status_createdAt_idx" ON "OportunidadeItem"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "OportunidadeItem" ADD CONSTRAINT "OportunidadeItem_companyItemId_fkey" FOREIGN KEY ("companyItemId") REFERENCES "CompanyItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeItemPricing" ADD CONSTRAINT "OportunidadeItemPricing_oportunidadeItemId_fkey" FOREIGN KEY ("oportunidadeItemId") REFERENCES "OportunidadeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeItemDisputa" ADD CONSTRAINT "OportunidadeItemDisputa_oportunidadeItemId_fkey" FOREIGN KEY ("oportunidadeItemId") REFERENCES "OportunidadeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
