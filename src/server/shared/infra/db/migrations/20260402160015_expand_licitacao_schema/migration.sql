-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "editalNumber" TEXT,
ADD COLUMN     "editalUrl" TEXT,
ADD COLUMN     "portal" TEXT,
ADD COLUMN     "proposalDeadline" TIMESTAMP(3),
ADD COLUMN     "publicationDate" TIMESTAMP(3),
ADD COLUMN     "sphere" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "EditalAnalysis" ADD COLUMN     "editalNumber" TEXT,
ADD COLUMN     "editalUrl" TEXT,
ADD COLUMN     "portal" TEXT,
ADD COLUMN     "proposalDeadline" TIMESTAMP(3),
ADD COLUMN     "publicationDate" TIMESTAMP(3),
ADD COLUMN     "sphere" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "EditalHistory" ADD COLUMN     "editalNumber" TEXT,
ADD COLUMN     "editalUrl" TEXT,
ADD COLUMN     "portal" TEXT,
ADD COLUMN     "proposalDeadline" TIMESTAMP(3),
ADD COLUMN     "publicationDate" TIMESTAMP(3),
ADD COLUMN     "sphere" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "analystId" TEXT;

-- AlterTable
ALTER TABLE "Tender" ADD COLUMN     "allowsAdhesion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bidInterval" DOUBLE PRECISION,
ADD COLUMN     "clarificationDeadline" TIMESTAMP(3),
ADD COLUMN     "disputeMode" TEXT,
ADD COLUMN     "exclusiveSmallBusiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "judgmentCriteria" TEXT,
ADD COLUMN     "processNumber" TEXT,
ADD COLUMN     "proposalDeadlineTime" TEXT,
ADD COLUMN     "proposalValidityDays" INTEGER,
ADD COLUMN     "regionality" TEXT,
ADD COLUMN     "uasg" TEXT;

-- AlterTable
ALTER TABLE "TenderHistory" ADD COLUMN     "allowsAdhesion" BOOLEAN,
ADD COLUMN     "bidInterval" DOUBLE PRECISION,
ADD COLUMN     "clarificationDeadline" TIMESTAMP(3),
ADD COLUMN     "disputeMode" TEXT,
ADD COLUMN     "exclusiveSmallBusiness" BOOLEAN,
ADD COLUMN     "judgmentCriteria" TEXT,
ADD COLUMN     "processNumber" TEXT,
ADD COLUMN     "proposalDeadlineTime" TEXT,
ADD COLUMN     "proposalValidityDays" INTEGER,
ADD COLUMN     "regionality" TEXT,
ADD COLUMN     "uasg" TEXT;

-- CreateTable
CREATE TABLE "TenderRules" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "deliveryDays" INTEGER,
    "acceptanceDays" INTEGER,
    "liquidationDays" INTEGER,
    "paymentDays" INTEGER,
    "guaranteeType" TEXT,
    "guaranteeMonths" INTEGER,
    "installation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderLogistics" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "agencyCnpj" TEXT,
    "agencyStateRegistration" TEXT,
    "deliveryLocation" TEXT,
    "zipCode" TEXT,
    "street" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "complement" TEXT,
    "auctioneerName" TEXT,
    "auctioneerContact" TEXT,
    "contractManagerName" TEXT,
    "contractManagerContact" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderLogistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderRequiredDocument" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderRequiredDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "stateRegistration" TEXT,
    "sphere" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderManagingAgency" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "itemCount" INTEGER,
    "quantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderManagingAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderParticipatingAgency" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "itemCount" INTEGER,
    "quantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderParticipatingAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityItem" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "lot" TEXT,
    "erpSku" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "editalDescription" TEXT,
    "quantity" DOUBLE PRECISION,
    "unitValue" DOUBLE PRECISION,
    "minBidValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenderRules_tenderId_key" ON "TenderRules"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderLogistics_tenderId_key" ON "TenderLogistics"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderRequiredDocument_tenderId_documentType_key" ON "TenderRequiredDocument"("tenderId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "TenderManagingAgency_tenderId_key" ON "TenderManagingAgency"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "TenderParticipatingAgency_tenderId_agencyId_key" ON "TenderParticipatingAgency"("tenderId", "agencyId");

-- AddForeignKey
ALTER TABLE "TenderRules" ADD CONSTRAINT "TenderRules_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderLogistics" ADD CONSTRAINT "TenderLogistics_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderRequiredDocument" ADD CONSTRAINT "TenderRequiredDocument_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderManagingAgency" ADD CONSTRAINT "TenderManagingAgency_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderManagingAgency" ADD CONSTRAINT "TenderManagingAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderParticipatingAgency" ADD CONSTRAINT "TenderParticipatingAgency_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderParticipatingAgency" ADD CONSTRAINT "TenderParticipatingAgency_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityItem" ADD CONSTRAINT "OpportunityItem_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
