CREATE TYPE "DocumentType" AS ENUM ('EDITAL', 'ANEXO', 'OUTRO');

ALTER TABLE "Document"
ADD COLUMN "type" "DocumentType" NOT NULL DEFAULT 'EDITAL';

CREATE INDEX "Document_type_createdAt_idx" ON "Document"("type", "createdAt");
