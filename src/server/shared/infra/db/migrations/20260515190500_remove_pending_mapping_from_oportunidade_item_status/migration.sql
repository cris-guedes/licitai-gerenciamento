ALTER TABLE "OportunidadeItem"
ALTER COLUMN "status" DROP DEFAULT;

UPDATE "OportunidadeItem"
SET "status" = 'PENDING_PRICING'
WHERE "status" = 'PENDING_MAPPING';

ALTER TYPE "OportunidadeItemStatus" RENAME TO "OportunidadeItemStatus_old";

CREATE TYPE "OportunidadeItemStatus" AS ENUM (
  'PENDING_PRICING',
  'READY_FOR_BID',
  'IN_BIDDING',
  'WON',
  'LOST',
  'DISCARDED'
);

ALTER TABLE "OportunidadeItem"
ALTER COLUMN "status"
TYPE "OportunidadeItemStatus"
USING ("status"::text::"OportunidadeItemStatus");

ALTER TABLE "OportunidadeItem"
ALTER COLUMN "status" SET DEFAULT 'PENDING_PRICING';

DROP TYPE "OportunidadeItemStatus_old";
