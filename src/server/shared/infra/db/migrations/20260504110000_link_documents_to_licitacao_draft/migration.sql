CREATE TYPE "LicitacaoStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE "EditalStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE "Licitacao" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "status" "LicitacaoStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "metadados" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licitacao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Edital" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "status" "EditalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "orgaoCnpj" TEXT,
    "orgaoRazaoSocial" TEXT,
    "orgaoEsfera" TEXT,
    "orgaoPoder" TEXT,
    "unidadeCodigo" TEXT,
    "unidadeNome" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "numero" TEXT,
    "processo" TEXT,
    "modalidade" TEXT,
    "tipoInstrumento" TEXT,
    "modoDisputa" TEXT,
    "amparoLegal" TEXT,
    "srp" BOOLEAN NOT NULL DEFAULT false,
    "objeto" TEXT,
    "informacaoComplementar" TEXT,
    "dataAbertura" TIMESTAMP(3),
    "dataEncerramento" TIMESTAMP(3),
    "valorEstimado" DECIMAL(15,2),
    "dadosExtraidos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edital_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Document"
ADD COLUMN "editalId" TEXT;

ALTER TABLE "Licitacao"
ADD CONSTRAINT "Licitacao_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Licitacao"
ADD CONSTRAINT "Licitacao_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Edital"
ADD CONSTRAINT "Edital_licitacaoId_fkey"
FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Edital"
ADD CONSTRAINT "Edital_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Edital"
ADD CONSTRAINT "Edital_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Document"
ADD CONSTRAINT "Document_editalId_fkey"
FOREIGN KEY ("editalId") REFERENCES "Edital"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Edital_licitacaoId_key" ON "Edital"("licitacaoId");
CREATE INDEX "Licitacao_companyId_createdAt_idx" ON "Licitacao"("companyId", "createdAt");
CREATE INDEX "Licitacao_createdById_createdAt_idx" ON "Licitacao"("createdById", "createdAt");
CREATE INDEX "Licitacao_status_createdAt_idx" ON "Licitacao"("status", "createdAt");
CREATE INDEX "Edital_companyId_createdAt_idx" ON "Edital"("companyId", "createdAt");
CREATE INDEX "Edital_createdById_createdAt_idx" ON "Edital"("createdById", "createdAt");
CREATE INDEX "Edital_status_createdAt_idx" ON "Edital"("status", "createdAt");
CREATE INDEX "Document_editalId_createdAt_idx" ON "Document"("editalId", "createdAt");
