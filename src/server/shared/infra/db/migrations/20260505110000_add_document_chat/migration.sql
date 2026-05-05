-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

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
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChat" ADD CONSTRAINT "DocumentChat_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "DocumentChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageSource" ADD CONSTRAINT "ChatMessageSource_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
