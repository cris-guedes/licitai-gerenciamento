-- Add direct tenant scope to DocumentAnalysis
ALTER TABLE "DocumentAnalysis"
ADD COLUMN "companyId" TEXT;

-- Backfill from parent Document
UPDATE "DocumentAnalysis" da
SET "companyId" = d."companyId"
FROM "Document" d
WHERE da."documentId" = d."id"
  AND da."companyId" IS NULL;

-- Enforce not null after backfill
ALTER TABLE "DocumentAnalysis"
ALTER COLUMN "companyId" SET NOT NULL;

-- Add tenant index and foreign key
CREATE INDEX "DocumentAnalysis_companyId_createdAt_idx" ON "DocumentAnalysis"("companyId", "createdAt");

ALTER TABLE "DocumentAnalysis"
ADD CONSTRAINT "DocumentAnalysis_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
