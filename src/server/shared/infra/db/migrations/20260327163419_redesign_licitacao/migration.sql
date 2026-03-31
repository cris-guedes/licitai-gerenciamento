/*
  Warnings:

  - You are about to drop the column `amparoLegalId` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `amparoLegalNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `anoCompra` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `cnpjOrgao` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `dataAberturaProposta` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `dataAtualizacaoPncp` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `dataEncerramentoProposta` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `dataPublicacaoPncp` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `linkProcessoEletronico` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `linkSistemaOrigem` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `modalidadeId` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `modalidadeNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `modoDisputaId` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `modoDisputaNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `municipioNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `numeroCompra` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `numeroControlePncp` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `objetoCompra` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `orgaoEsferaId` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `orgaoEsferaNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `orgaoPoderI` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `sequencialCompra` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `situacaoId` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `situacaoNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `syncedAt` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `tipoInstrumentoId` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `tipoInstrumentoNome` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `Licitacao` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotalHomologado` on the `Licitacao` table. All the data in the column will be lost.
  - Added the required column `numero` to the `Licitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objeto` to the `Licitacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Licitacao_cnpjOrgao_anoCompra_sequencialCompra_key";

-- DropIndex
DROP INDEX "Licitacao_numeroControlePncp_key";

-- AlterTable
ALTER TABLE "Licitacao" DROP COLUMN "amparoLegalId",
DROP COLUMN "amparoLegalNome",
DROP COLUMN "anoCompra",
DROP COLUMN "cnpjOrgao",
DROP COLUMN "dataAberturaProposta",
DROP COLUMN "dataAtualizacaoPncp",
DROP COLUMN "dataEncerramentoProposta",
DROP COLUMN "dataPublicacaoPncp",
DROP COLUMN "linkProcessoEletronico",
DROP COLUMN "linkSistemaOrigem",
DROP COLUMN "modalidadeId",
DROP COLUMN "modalidadeNome",
DROP COLUMN "modoDisputaId",
DROP COLUMN "modoDisputaNome",
DROP COLUMN "municipioNome",
DROP COLUMN "numeroCompra",
DROP COLUMN "numeroControlePncp",
DROP COLUMN "objetoCompra",
DROP COLUMN "orgaoEsferaId",
DROP COLUMN "orgaoEsferaNome",
DROP COLUMN "orgaoPoderI",
DROP COLUMN "sequencialCompra",
DROP COLUMN "situacaoId",
DROP COLUMN "situacaoNome",
DROP COLUMN "syncedAt",
DROP COLUMN "tipoInstrumentoId",
DROP COLUMN "tipoInstrumentoNome",
DROP COLUMN "valorTotal",
DROP COLUMN "valorTotalHomologado",
ADD COLUMN     "amparoLegal" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataAbertura" TIMESTAMP(3),
ADD COLUMN     "dataEncerramento" TIMESTAMP(3),
ADD COLUMN     "metadados" JSONB,
ADD COLUMN     "modalidade" TEXT,
ADD COLUMN     "modoDisputa" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "objeto" TEXT NOT NULL,
ADD COLUMN     "orgaoEsfera" TEXT,
ADD COLUMN     "orgaoPoder" TEXT,
ADD COLUMN     "tipoInstrumento" TEXT,
ADD COLUMN     "valorEstimado" DECIMAL(15,2);
