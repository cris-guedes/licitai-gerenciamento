-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('EDITAL', 'ANEXO', 'OUTRO');

-- CreateEnum
CREATE TYPE "LicitacaoSourceSystem" AS ENUM ('PNCP', 'COMPRAS_GOV', 'PORTAL_EXTERNO', 'MANUAL');

-- CreateEnum
CREATE TYPE "LicitacaoStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EditalStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentAnalysisType" AS ENUM ('EXTRACT_EDITAL', 'SUMMARY');

-- CreateEnum
CREATE TYPE "DocumentAnalysisStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

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

-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "situacao_cadastral" TEXT,
    "data_situacao_cadastral" TEXT,
    "data_abertura" TEXT,
    "porte" TEXT,
    "natureza_juridica" TEXT,
    "cnae_fiscal" INTEGER,
    "cnae_fiscal_descricao" TEXT,
    "cnaes_secundarios" JSONB,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "telefone_1" TEXT,
    "email_empresa" TEXT,
    "capital_social" DOUBLE PRECISION,
    "opcao_pelo_simples" BOOLEAN,
    "opcao_pelo_mei" BOOLEAN,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMembership" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "organizationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licitacao" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "status" "LicitacaoStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "metadados" JSONB,
    "sourceSystem" "LicitacaoSourceSystem",
    "sourceReference" TEXT,
    "numeroControlePncp" TEXT,
    "anoCompra" INTEGER,
    "sequencialCompra" INTEGER,
    "numeroLicitacao" TEXT,
    "processoAdministrativo" TEXT,
    "modalidadeNome" TEXT,
    "tipoInstrumentoNome" TEXT,
    "objetoResumo" TEXT,
    "situacaoOficial" TEXT,
    "valorEstimadoTotal" DECIMAL(15,2),
    "valorHomologadoTotal" DECIMAL(15,2),
    "dataPublicacao" TIMESTAMP(3),
    "dataAberturaProposta" TIMESTAMP(3),
    "dataEncerramentoProposta" TIMESTAMP(3),
    "linkSistemaOrigem" TEXT,
    "linkProcessoEletronico" TEXT,
    "ultimaAtualizacaoOficial" TIMESTAMP(3),
    "orgaoGerenciadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edital" (
    "id" TEXT NOT NULL,
    "licitacaoId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "status" "EditalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "versao" INTEGER NOT NULL DEFAULT 1,
    "isAtual" BOOLEAN NOT NULL DEFAULT true,
    "tipoVersao" "EditalTipoVersao" NOT NULL DEFAULT 'ORIGINAL',
    "documentoPrincipalId" TEXT,
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

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "editalId" TEXT,
    "createdById" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'EDITAL',
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'cloudflare_r2',
    "storageBucket" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "vectorDocumentId" TEXT NOT NULL,
    "vectorCollectionName" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAnalysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT,
    "type" "DocumentAnalysisType" NOT NULL,
    "status" "DocumentAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "markdownContent" TEXT,
    "result" JSONB,
    "metrics" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentAnalysis_pkey" PRIMARY KEY ("id")
);

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
    "licitacaoId" TEXT,
    "editalId" TEXT,
    "workflowDefinitionId" TEXT,
    "currentNodeId" TEXT,
    "currentPhaseNodeId" TEXT,
    "currentStatusNodeId" TEXT,
    "currentSituationNodeId" TEXT,
    "responsavelUserId" TEXT,
    "status" "OportunidadeStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "workflowUpdatedAt" TIMESTAMP(3),
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
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNodeKind" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentKindId" TEXT,
    "color" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowNodeKind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowNode" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "kindId" TEXT NOT NULL,
    "parentId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "color" TEXT,
    "isInitial" BOOLEAN NOT NULL DEFAULT false,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTransition" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "transitionType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "DocumentChat" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessageSource" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "page" INTEGER,
    "score" DOUBLE PRECISION NOT NULL,
    "snippet" TEXT NOT NULL,
    "heading" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessageSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "Company"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "Membership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMembership_membershipId_companyId_key" ON "CompanyMembership"("membershipId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Licitacao_numeroControlePncp_key" ON "Licitacao"("numeroControlePncp");

-- CreateIndex
CREATE INDEX "Licitacao_companyId_createdAt_idx" ON "Licitacao"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Licitacao_createdById_createdAt_idx" ON "Licitacao"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Licitacao_orgaoGerenciadorId_createdAt_idx" ON "Licitacao"("orgaoGerenciadorId", "createdAt");

-- CreateIndex
CREATE INDEX "Licitacao_status_createdAt_idx" ON "Licitacao"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Edital_licitacaoId_key" ON "Edital"("licitacaoId");

-- CreateIndex
CREATE INDEX "Edital_companyId_createdAt_idx" ON "Edital"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Edital_createdById_createdAt_idx" ON "Edital"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Edital_documentoPrincipalId_idx" ON "Edital"("documentoPrincipalId");

-- CreateIndex
CREATE INDEX "Edital_status_createdAt_idx" ON "Edital"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Document_vectorDocumentId_key" ON "Document"("vectorDocumentId");

-- CreateIndex
CREATE INDEX "Document_companyId_createdAt_idx" ON "Document"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_editalId_createdAt_idx" ON "Document"("editalId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_createdById_createdAt_idx" ON "Document"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Document_status_createdAt_idx" ON "Document"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Document_type_createdAt_idx" ON "Document"("type", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_companyId_createdAt_idx" ON "DocumentAnalysis"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_documentId_type_createdAt_idx" ON "DocumentAnalysis"("documentId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_createdById_createdAt_idx" ON "DocumentAnalysis"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAnalysis_status_createdAt_idx" ON "DocumentAnalysis"("status", "createdAt");

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
CREATE INDEX "Oportunidade_workflowDefinitionId_createdAt_idx" ON "Oportunidade"("workflowDefinitionId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentNodeId_createdAt_idx" ON "Oportunidade"("currentNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentPhaseNodeId_createdAt_idx" ON "Oportunidade"("currentPhaseNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentStatusNodeId_createdAt_idx" ON "Oportunidade"("currentStatusNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentSituationNodeId_createdAt_idx" ON "Oportunidade"("currentSituationNodeId", "createdAt");

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
CREATE INDEX "WorkflowDefinition_companyId_isActive_createdAt_idx" ON "WorkflowDefinition"("companyId", "isActive", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_companyId_slug_version_key" ON "WorkflowDefinition"("companyId", "slug", "version");

-- CreateIndex
CREATE INDEX "WorkflowNodeKind_workflowDefinitionId_order_idx" ON "WorkflowNodeKind"("workflowDefinitionId", "order");

-- CreateIndex
CREATE INDEX "WorkflowNodeKind_parentKindId_order_idx" ON "WorkflowNodeKind"("parentKindId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowNodeKind_workflowDefinitionId_key_key" ON "WorkflowNodeKind"("workflowDefinitionId", "key");

-- CreateIndex
CREATE INDEX "WorkflowNode_workflowDefinitionId_order_idx" ON "WorkflowNode"("workflowDefinitionId", "order");

-- CreateIndex
CREATE INDEX "WorkflowNode_kindId_order_idx" ON "WorkflowNode"("kindId", "order");

-- CreateIndex
CREATE INDEX "WorkflowNode_parentId_order_idx" ON "WorkflowNode"("parentId", "order");

-- CreateIndex
CREATE INDEX "WorkflowNode_workflowDefinitionId_key_idx" ON "WorkflowNode"("workflowDefinitionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowNode_workflowDefinitionId_path_key" ON "WorkflowNode"("workflowDefinitionId", "path");

-- CreateIndex
CREATE INDEX "WorkflowTransition_workflowDefinitionId_createdAt_idx" ON "WorkflowTransition"("workflowDefinitionId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowTransition_fromNodeId_createdAt_idx" ON "WorkflowTransition"("fromNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowTransition_toNodeId_createdAt_idx" ON "WorkflowTransition"("toNodeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTransition_workflowDefinitionId_fromNodeId_toNodeId_key" ON "WorkflowTransition"("workflowDefinitionId", "fromNodeId", "toNodeId");

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
CREATE UNIQUE INDEX "DocumentChat_documentId_key" ON "DocumentChat"("documentId");

-- CreateIndex
CREATE INDEX "DocumentChat_organizationId_createdAt_idx" ON "DocumentChat"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_createdAt_idx" ON "ChatMessage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessageSource_messageId_createdAt_idx" ON "ChatMessageSource"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessageSource_chunkId_createdAt_idx" ON "ChatMessageSource"("chunkId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMembership" ADD CONSTRAINT "CompanyMembership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacao" ADD CONSTRAINT "Licitacao_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacao" ADD CONSTRAINT "Licitacao_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacao" ADD CONSTRAINT "Licitacao_orgaoGerenciadorId_fkey" FOREIGN KEY ("orgaoGerenciadorId") REFERENCES "OrgaoPublico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_licitacaoId_fkey" FOREIGN KEY ("licitacaoId") REFERENCES "Licitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edital" ADD CONSTRAINT "Edital_documentoPrincipalId_fkey" FOREIGN KEY ("documentoPrincipalId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_editalId_fkey" FOREIGN KEY ("editalId") REFERENCES "Edital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAnalysis" ADD CONSTRAINT "DocumentAnalysis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_currentNodeId_fkey" FOREIGN KEY ("currentNodeId") REFERENCES "WorkflowNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_currentPhaseNodeId_fkey" FOREIGN KEY ("currentPhaseNodeId") REFERENCES "WorkflowNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_currentStatusNodeId_fkey" FOREIGN KEY ("currentStatusNodeId") REFERENCES "WorkflowNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_currentSituationNodeId_fkey" FOREIGN KEY ("currentSituationNodeId") REFERENCES "WorkflowNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_responsavelUserId_fkey" FOREIGN KEY ("responsavelUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeItem" ADD CONSTRAINT "OportunidadeItem_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeItem" ADD CONSTRAINT "OportunidadeItem_editalItemId_fkey" FOREIGN KEY ("editalItemId") REFERENCES "EditalItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNodeKind" ADD CONSTRAINT "WorkflowNodeKind_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNodeKind" ADD CONSTRAINT "WorkflowNodeKind_parentKindId_fkey" FOREIGN KEY ("parentKindId") REFERENCES "WorkflowNodeKind"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "WorkflowNodeKind"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowNode" ADD CONSTRAINT "WorkflowNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "WorkflowNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "DocumentChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageSource" ADD CONSTRAINT "ChatMessageSource_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
