/*
  Warnings:

  - You are about to drop the column `name` on the `Company` table. All the data in the column will be lost.
  - Added the required column `razao_social` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Made the column `cnpj` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "name",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "capital_social" DOUBLE PRECISION,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cnae_fiscal" INTEGER,
ADD COLUMN     "cnae_fiscal_descricao" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "data_abertura" TEXT,
ADD COLUMN     "data_situacao_cadastral" TEXT,
ADD COLUMN     "email_empresa" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "natureza_juridica" TEXT,
ADD COLUMN     "nome_fantasia" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "opcao_pelo_mei" BOOLEAN,
ADD COLUMN     "opcao_pelo_simples" BOOLEAN,
ADD COLUMN     "porte" TEXT,
ADD COLUMN     "razao_social" TEXT NOT NULL,
ADD COLUMN     "situacao_cadastral" TEXT,
ADD COLUMN     "telefone_1" TEXT,
ADD COLUMN     "uf" TEXT,
ALTER COLUMN "cnpj" SET NOT NULL;
