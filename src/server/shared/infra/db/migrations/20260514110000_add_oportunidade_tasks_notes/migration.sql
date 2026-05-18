-- CreateEnum
CREATE TYPE "OportunidadeTaskStatus" AS ENUM ('OPEN', 'DONE');

-- CreateTable
CREATE TABLE "OportunidadeTask" (
    "id" TEXT NOT NULL,
    "oportunidadeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "OportunidadeTaskStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OportunidadeTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OportunidadeNote" (
    "id" TEXT NOT NULL,
    "oportunidadeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OportunidadeNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OportunidadeTask_oportunidadeId_createdAt_idx" ON "OportunidadeTask"("oportunidadeId", "createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeTask_companyId_createdAt_idx" ON "OportunidadeTask"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeTask_status_createdAt_idx" ON "OportunidadeTask"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeTask_dueAt_idx" ON "OportunidadeTask"("dueAt");

-- CreateIndex
CREATE INDEX "OportunidadeNote_oportunidadeId_createdAt_idx" ON "OportunidadeNote"("oportunidadeId", "createdAt");

-- CreateIndex
CREATE INDEX "OportunidadeNote_companyId_createdAt_idx" ON "OportunidadeNote"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "OportunidadeTask" ADD CONSTRAINT "OportunidadeTask_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeTask" ADD CONSTRAINT "OportunidadeTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeTask" ADD CONSTRAINT "OportunidadeTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeNote" ADD CONSTRAINT "OportunidadeNote_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeNote" ADD CONSTRAINT "OportunidadeNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OportunidadeNote" ADD CONSTRAINT "OportunidadeNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
