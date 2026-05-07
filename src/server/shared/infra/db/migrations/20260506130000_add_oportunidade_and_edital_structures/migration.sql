-- CreateEnum
CREATE TYPE "LicitacaoSourceSystem" AS ENUM ('PNCP', 'COMPRAS_GOV', 'PORTAL_EXTERNO', 'MANUAL');

-- CreateEnum
CREATE TYPE "EditalTipoVersao" AS ENUM ('ORIGINAL', 'RETIFICACAO', 'ADENDO', 'CONSOLIDADO');

-- CreateEnum
CREATE TYPE "EditalItemTipo" AS ENUM ('MATERIAL', 'SERVICO');

-- CreateEnum
CREATE TYPE "EditalOrgaoPapel" AS ENUM ('GERENCIADOR', 'PARTICIPANTE');

-- CreateEnum
CREATE TYPE "OrgaoEsfera" AS ENUM ('FEDERAL', 'ESTADUAL', 'MUNICIPAL');

-- CreateEnum
CREATE TYPE "OrgaoPoder" AS ENUM ('EXECUTIVO', 'LEGISLATIVO', 'JUDICIARIO');

-- CreateEnum
CREATE TYPE "EditalAnalysisType" AS ENUM ('EXTRACT_CADASTRO', 'SUMMARY_GERAL');

-- CreateEnum
CREATE TYPE "EditalAnalysisStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "OportunidadeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "documentoPrincipalId" TEXT,
ADD COLUMN     "isAtual" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tipoVersao" "EditalTipoVersao" NOT NULL DEFAULT 'ORIGINAL',
ADD COLUMN     "versao" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Licitacao" ADD COLUMN     "anoCompra" INTEGER,
ADD COLUMN     "dataAberturaProposta" TIMESTAMP(3),
ADD COLUMN     "dataEncerramentoProposta" TIMESTAMP(3),
ADD COLUMN     "dataPublicacao" TIMESTAMP(3),
ADD COLUMN     "linkProcessoEletronico" TEXT,
ADD COLUMN     "linkSistemaOrigem" TEXT,
ADD COLUMN     "modalidadeNome" TEXT,
ADD COLUMN     "numeroControlePncp" TEXT,
ADD COLUMN     "numeroLicitacao" TEXT,
ADD COLUMN     "objetoResumo" TEXT,
ADD COLUMN     "orgaoGerenciadorId" TEXT,
ADD COLUMN     "processoAdministrativo" TEXT,
ADD COLUMN     "sequencialCompra" INTEGER,
ADD COLUMN     "situacaoOficial" TEXT,
ADD COLUMN     "sourceReference" TEXT,
ADD COLUMN     "sourceSystem" "LicitacaoSourceSystem",
ADD COLUMN     "tipoInstrumentoNome" TEXT,
ADD COLUMN     "ultimaAtualizacaoOficial" TIMESTAMP(3),
ADD COLUMN     "valorEstimadoTotal" DECIMAL(15,2),
ADD COLUMN     "valorHomologadoTotal" DECIMAL(15,2);

-- CreateTable
CREATE TABLE "EditalAnalysis" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "type" "EditalAnalysisType" NOT NULL,
    "status" "EditalAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "metrics" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oportunidade" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "responsavelUserId" TEXT,
    "status" "OportunidadeStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Oportunidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OportunidadeItem" (
    "id" TEXT NOT NULL,
    "oportunidadeId" TEXT NOT NULL,
    "editalItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OportunidadeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgaoPublico" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT,
    "razaoSocial" TEXT,
    "codigoUnidade" TEXT,
    "nomeUnidade" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "esfera" "OrgaoEsfera",
    "poder" "OrgaoPoder",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgaoPublico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditalCronograma" (
    "editalId" TEXT NOT NULL,
    "acolhimentoInicio" TIMESTAMP(3),
    "acolhimentoFim" TIMESTAMP(3),
    "horaLimite" TEXT,
    "sessaoPublicaEm" TIMESTAMP(3),
    "esclarecimentosAte" TIMESTAMP(3),
    "impugnacaoAte" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalCronograma_pkey" PRIMARY KEY ("editalId")
);

-- CreateTable
CREATE TABLE "EditalCertame" (
    "editalId" TEXT NOT NULL,
    "modoDisputa" TEXT,
    "criterioJulgamento" TEXT,
    "tipoLance" TEXT,
    "intervaloLances" TEXT,
    "duracaoSessaoMinutos" INTEGER,
    "exclusivoMeEpp" BOOLEAN,
    "permiteConsorcio" BOOLEAN,
    "exigeVisitaTecnica" BOOLEAN,
    "permiteAdesao" BOOLEAN,
    "percentualAdesao" DECIMAL(8,2),
    "regionalidade" TEXT,
    "difal" BOOLEAN,
    "vigenciaAtaMeses" INTEGER,
    "vigenciaContratoDias" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalCertame_pkey" PRIMARY KEY ("editalId")
);

-- CreateTable
CREATE TABLE "EditalItem" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "numeroItem" INTEGER,
    "descricao" TEXT,
    "tipoItem" "EditalItemTipo",
    "lote" TEXT,
    "quantidadeTotal" DECIMAL(18,4),
    "unidadeMedida" TEXT,
    "valorUnitarioEstimado" DECIMAL(15,2),
    "valorTotalEstimado" DECIMAL(15,2),
    "codigoCatmatCatser" TEXT,
    "codigoNcmNbs" TEXT,
    "criterioJulgamentoItem" TEXT,
    "beneficioTributario" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditalOrgao" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "orgaoId" TEXT NOT NULL,
    "papel" "EditalOrgaoPapel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalOrgao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditalOrgaoItem" (
    "id" TEXT NOT NULL,
    "editalOrgaoId" TEXT NOT NULL,
    "editalItemId" TEXT NOT NULL,
    "quantidadeSolicitada" DECIMAL(18,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalOrgaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditalHabilitacaoExigencia" (
    "id" TEXT NOT NULL,
    "editalId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditalHabilitacaoExigencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EditalAnalysis_companyId_createdAt_idx" ON "EditalAnalysis"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "EditalAnalysis_createdById_createdAt_idx" ON "EditalAnalysis"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "EditalAnalysis_editalId_type_createdAt_idx" ON "EditalAnalysis"("editalId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "EditalAnalysis_status_createdAt_idx" ON "EditalAnalysis"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_companyId_createdAt_idx" ON "Oportunidade"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_licitacaoId_createdAt_idx" ON "Oportunidade"("licitacaoId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_editalId_createdAt_idx" ON "Oportunidade"("editalId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_responsavelUserId_createdAt_idx" ON "Oportunidade"("responsavelUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_status_createdAt_idx" ON "Oportunidade"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Oportunidade_companyId_licitacaoId_key" ON "Oportunidade"("companyId", "licitacaoId");

-- CreateIndex
CREATE INDEX "OportunidadeItem_oportunidadeId_createdAt_idx" ON "OportunidadeItem"("oportunidadeId", "createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeItem_editalItemId_createdAt_idx" ON "OportunidadeItem"("editalItemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OportunidadeItem_oportunidadeId_editalItemId_key" ON "OportunidadeItem"("oportunidadeId", "editalItemId");

-- CreateIndex
CREATE INDEX "OrgaoPublico_cnpj_idx" ON "OrgaoPublico"("cnpj");

-- CreateIndex
CREATE INDEX "OrgaoPublico_codigoUnidade_idx" ON "OrgaoPublico"("codigoUnidade");

-- CreateIndex
CREATE INDEX "EditalItem_editalId_createdAt_idx" ON "EditalItem"("editalId", "createdAt");

-- CreateIndex
CREATE INDEX "EditalItem_editalId_numeroItem_idx" ON "EditalItem"("editalId", "numeroItem");

-- CreateIndex
CREATE INDEX "EditalOrgao_editalId_createdAt_idx" ON "EditalOrgao"("editalId", "createdAt");

-- CreateIndex
CREATE INDEX "EditalOrgao_orgaoId_createdAt_idx" ON "EditalOrgao"("orgaoId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EditalOrgao_editalId_orgaoId_papel_key" ON "EditalOrgao"("editalId", "orgaoId", "papel");

-- CreateIndex
CREATE INDEX "EditalOrgaoItem_editalOrgaoId_createdAt_idx" ON "EditalOrgaoItem"("editalOrgaoId", "createdAt");

-- CreateIndex
CREATE INDEX "EditalOrgaoItem_editalItemId_createdAt_idx" ON "EditalOrgaoItem"("editalItemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EditalOrgaoItem_editalOrgaoId_editalItemId_key" ON "EditalOrgaoItem"("editalOrgaoId", "editalItemId");

-- CreateIndex
CREATE INDEX "EditalHabilitacaoExigencia_editalId_createdAt_idx" ON "EditalHabilitacaoExigencia"("editalId", "createdAt");

-- CreateIndex
CREATE INDEX "EditalHabilitacaoExigencia_editalId_ordem_idx" ON "EditalHabilitacaoExigencia"("editalId", "ordem");

-- CreateIndex
CREATE INDEX "Edital_documentoPrincipalId_idx" ON "Edital"("documentoPrincipalId");

-- CreateIndex
CREATE UNIQUE INDEX "Licitacao_numeroControlePncp_key" ON "Licitacao"("numeroControlePncp");

-- CreateIndex
CREATE INDEX "Licitacao_orgaoGerenciadorId_createdAt_idx" ON "Licitacao"("orgaoGerenciadorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Licitacao" ADD CONSTRAINT "Licitacao_orgaoGerenciadorId_fkey" FOREIGN KEY ("orgaoGerenciadorId") REFERENCES "OrgaoPublico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_documentoPrincipalId_fkey" FOREIGN KEY ("documentoPrincipalId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalAnalysis" ADD CONSTRAINT "EditalAnalysis_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalAnalysis" ADD CONSTRAINT "EditalAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalAnalysis" ADD CONSTRAINT "EditalAnalysis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_responsavelUserId_fkey" FOREIGN KEY ("responsavelUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeItem" ADD CONSTRAINT "OportunidadeItem_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeItem" ADD CONSTRAINT "OportunidadeItem_editalItemId_fkey" FOREIGN KEY ("editalItemId") REFERENCES "EditalItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalCronograma" ADD CONSTRAINT "EditalCronograma_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalCertame" ADD CONSTRAINT "EditalCertame_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalItem" ADD CONSTRAINT "EditalItem_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalOrgao" ADD CONSTRAINT "EditalOrgao_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalOrgao" ADD CONSTRAINT "EditalOrgao_orgaoId_fkey" FOREIGN KEY ("orgaoId") REFERENCES "OrgaoPublico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalOrgaoItem" ADD CONSTRAINT "EditalOrgaoItem_editalOrgaoId_fkey" FOREIGN KEY ("editalOrgaoId") REFERENCES "EditalOrgao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalOrgaoItem" ADD CONSTRAINT "EditalOrgaoItem_editalItemId_fkey" FOREIGN KEY ("editalItemId") REFERENCES "EditalItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditalHabilitacaoExigencia" ADD CONSTRAINT "EditalHabilitacaoExigencia_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
