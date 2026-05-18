-- CreateEnum
CREATE TYPE "ContratoStatus" AS ENUM ('RASCUNHO', 'VIGENTE', 'ENCERRADO', 'RESCINDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ContratoEmpenhoStatus" AS ENUM ('ATIVO', 'CANCELADO', 'UTILIZADO');

-- CreateEnum
CREATE TYPE "EmpenhoEntregaStatus" AS ENUM ('PENDENTE', 'ENTREGUE', 'ACEITE_PROVISORIO', 'ACEITE_DEFINITIVO', 'PAGO', 'REJEITADO');

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "oportunidadeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "numeroContrato" TEXT,
    "anoContrato" INTEGER,
    "processo" TEXT,
    "objetoContrato" TEXT,
    "tipoContrato" TEXT,
    "fornecedorCnpjCpf" TEXT,
    "fornecedorNome" TEXT,
    "valorInicial" DECIMAL(15,2),
    "valorGlobal" DECIMAL(15,2),
    "dataAssinatura" TIMESTAMP(3),
    "dataVigenciaInicio" TIMESTAMP(3),
    "dataVigenciaFim" TIMESTAMP(3),
    "dataPublicacao" TIMESTAMP(3),
    "prazoEntregaDias" INTEGER,
    "prazoPagamentoDias" INTEGER,
    "prazoAceiteDias" INTEGER,
    "garantiaTipo" TEXT,
    "garantiaMeses" INTEGER,
    "numeroControlePncp" TEXT,
    "sequencialContrato" INTEGER,
    "status" "ContratoStatus" NOT NULL DEFAULT 'RASCUNHO',
    "informacaoComplementar" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoItem" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "oportunidadeItemId" TEXT NOT NULL,
    "quantidadeContratada" DECIMAL(18,4),
    "valorUnitario" DECIMAL(15,2),
    "valorTotal" DECIMAL(15,2),
    "quantidadeEmpenhada" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantidadeEntregue" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantidadePaga" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoEmpenho" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "numeroEmpenho" TEXT NOT NULL,
    "tipoEmpenho" TEXT,
    "valor" DECIMAL(15,2) NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "orgaoCnpj" TEXT,
    "orgaoNome" TEXT,
    "orgaoUnidadeNome" TEXT,
    "observacao" TEXT,
    "status" "ContratoEmpenhoStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoEmpenho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpenhoItem" (
    "id" TEXT NOT NULL,
    "empenhoId" TEXT NOT NULL,
    "contratoItemId" TEXT NOT NULL,
    "quantidade" DECIMAL(18,4) NOT NULL,
    "valorUnitario" DECIMAL(15,2),
    "valorTotal" DECIMAL(15,2),
    "quantidadeEntregue" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantidadeAceita" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantidadePaga" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpenhoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpenhoLocalEntrega" (
    "id" TEXT NOT NULL,
    "empenhoId" TEXT NOT NULL,
    "descricao" TEXT,
    "endereco" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "responsavel" TEXT,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpenhoLocalEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpenhoEntrega" (
    "id" TEXT NOT NULL,
    "empenhoItemId" TEXT NOT NULL,
    "localEntregaId" TEXT,
    "descricao" TEXT,
    "quantidadeEntregue" DECIMAL(18,4) NOT NULL,
    "numeroNotaFiscal" TEXT,
    "valorNotaFiscal" DECIMAL(15,2),
    "dataEntrega" TIMESTAMP(3),
    "dataAceiteProvisorio" TIMESTAMP(3),
    "dataAceiteDefinitivo" TIMESTAMP(3),
    "dataLimitePagamento" TIMESTAMP(3),
    "dataPagamento" TIMESTAMP(3),
    "entregueNoPrazo" BOOLEAN,
    "pagoNoPrazo" BOOLEAN,
    "status" "EmpenhoEntregaStatus" NOT NULL DEFAULT 'PENDENTE',
    "motivoRejeicao" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpenhoEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_numeroControlePncp_key" ON "Contrato"("numeroControlePncp");

-- CreateIndex
CREATE INDEX "Contrato_oportunidadeId_createdAt_idx" ON "Contrato"("oportunidadeId", "createdAt");

-- CreateIndex
CREATE INDEX "Contrato_companyId_createdAt_idx" ON "Contrato"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Contrato_status_createdAt_idx" ON "Contrato"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Contrato_dataVigenciaFim_idx" ON "Contrato"("dataVigenciaFim");

-- CreateIndex
CREATE INDEX "ContratoItem_contratoId_createdAt_idx" ON "ContratoItem"("contratoId", "createdAt");

-- CreateIndex
CREATE INDEX "ContratoItem_oportunidadeItemId_createdAt_idx" ON "ContratoItem"("oportunidadeItemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoItem_contratoId_oportunidadeItemId_key" ON "ContratoItem"("contratoId", "oportunidadeItemId");

-- CreateIndex
CREATE INDEX "ContratoEmpenho_contratoId_createdAt_idx" ON "ContratoEmpenho"("contratoId", "createdAt");

-- CreateIndex
CREATE INDEX "ContratoEmpenho_status_createdAt_idx" ON "ContratoEmpenho"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoEmpenho_contratoId_numeroEmpenho_key" ON "ContratoEmpenho"("contratoId", "numeroEmpenho");

-- CreateIndex
CREATE INDEX "EmpenhoItem_empenhoId_createdAt_idx" ON "EmpenhoItem"("empenhoId", "createdAt");

-- CreateIndex
CREATE INDEX "EmpenhoItem_contratoItemId_createdAt_idx" ON "EmpenhoItem"("contratoItemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmpenhoItem_empenhoId_contratoItemId_key" ON "EmpenhoItem"("empenhoId", "contratoItemId");

-- CreateIndex
CREATE INDEX "EmpenhoLocalEntrega_empenhoId_createdAt_idx" ON "EmpenhoLocalEntrega"("empenhoId", "createdAt");

-- CreateIndex
CREATE INDEX "EmpenhoEntrega_empenhoItemId_createdAt_idx" ON "EmpenhoEntrega"("empenhoItemId", "createdAt");

-- CreateIndex
CREATE INDEX "EmpenhoEntrega_localEntregaId_createdAt_idx" ON "EmpenhoEntrega"("localEntregaId", "createdAt");

-- CreateIndex
CREATE INDEX "EmpenhoEntrega_status_createdAt_idx" ON "EmpenhoEntrega"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoItem" ADD CONSTRAINT "ContratoItem_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoItem" ADD CONSTRAINT "ContratoItem_oportunidadeItemId_fkey" FOREIGN KEY ("oportunidadeItemId") REFERENCES "OportunidadeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoEmpenho" ADD CONSTRAINT "ContratoEmpenho_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpenhoItem" ADD CONSTRAINT "EmpenhoItem_empenhoId_fkey" FOREIGN KEY ("empenhoId") REFERENCES "ContratoEmpenho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpenhoItem" ADD CONSTRAINT "EmpenhoItem_contratoItemId_fkey" FOREIGN KEY ("contratoItemId") REFERENCES "ContratoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpenhoLocalEntrega" ADD CONSTRAINT "EmpenhoLocalEntrega_empenhoId_fkey" FOREIGN KEY ("empenhoId") REFERENCES "ContratoEmpenho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpenhoEntrega" ADD CONSTRAINT "EmpenhoEntrega_empenhoItemId_fkey" FOREIGN KEY ("empenhoItemId") REFERENCES "EmpenhoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpenhoEntrega" ADD CONSTRAINT "EmpenhoEntrega_localEntregaId_fkey" FOREIGN KEY ("localEntregaId") REFERENCES "EmpenhoLocalEntrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;
