-- AlterTable
ALTER TABLE "Oportunidade" ADD COLUMN     "currentNodeId" TEXT,
ADD COLUMN     "currentPhaseNodeId" TEXT,
ADD COLUMN     "currentSituationNodeId" TEXT,
ADD COLUMN     "currentStatusNodeId" TEXT,
ADD COLUMN     "workflowDefinitionId" TEXT,
ADD COLUMN     "workflowUpdatedAt" TIMESTAMP(3);

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
CREATE INDEX "Oportunidade_workflowDefinitionId_createdAt_idx" ON "Oportunidade"("workflowDefinitionId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentNodeId_createdAt_idx" ON "Oportunidade"("currentNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentPhaseNodeId_createdAt_idx" ON "Oportunidade"("currentPhaseNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentStatusNodeId_createdAt_idx" ON "Oportunidade"("currentStatusNodeId", "createdAt");

-- CreateIndex
CREATE INDEX "Oportunidade_currentSituationNodeId_createdAt_idx" ON "Oportunidade"("currentSituationNodeId", "createdAt");

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
