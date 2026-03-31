-- CreateTable
CREATE TABLE "Licitacao" (
    "id" TEXT NOT NULL,
    "cnpjOrgao" TEXT NOT NULL,
    "anoCompra" INTEGER NOT NULL,
    "sequencialCompra" INTEGER NOT NULL,
    "numeroControlePncp" TEXT,
    "numeroCompra" TEXT NOT NULL,
    "processo" TEXT,
    "modalidadeId" INTEGER,
    "modalidadeNome" TEXT,
    "tipoInstrumentoId" INTEGER,
    "tipoInstrumentoNome" TEXT,
    "situacaoId" TEXT,
    "situacaoNome" TEXT,
    "modoDisputaId" INTEGER,
    "modoDisputaNome" TEXT,
    "amparoLegalId" INTEGER,
    "amparoLegalNome" TEXT,
    "srp" BOOLEAN NOT NULL DEFAULT false,
    "objetoCompra" TEXT NOT NULL,
    "informacaoComplementar" TEXT,
    "dataAberturaProposta" TIMESTAMP(3),
    "dataEncerramentoProposta" TIMESTAMP(3),
    "dataPublicacaoPncp" TIMESTAMP(3),
    "dataAtualizacaoPncp" TIMESTAMP(3),
    "valorTotal" DECIMAL(15,2),
    "valorTotalHomologado" DECIMAL(15,2),
    "orgaoCnpj" TEXT NOT NULL,
    "orgaoRazaoSocial" TEXT,
    "orgaoEsferaId" TEXT,
    "orgaoEsferaNome" TEXT,
    "orgaoPoderI" TEXT,
    "unidadeCodigo" TEXT,
    "unidadeNome" TEXT,
    "municipioNome" TEXT,
    "uf" TEXT,
    "linkSistemaOrigem" TEXT,
    "linkProcessoEletronico" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licitacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Licitacao_numeroControlePncp_key" ON "Licitacao"("numeroControlePncp");

-- CreateIndex
CREATE UNIQUE INDEX "Licitacao_cnpjOrgao_anoCompra_sequencialCompra_key" ON "Licitacao"("cnpjOrgao", "anoCompra", "sequencialCompra");
