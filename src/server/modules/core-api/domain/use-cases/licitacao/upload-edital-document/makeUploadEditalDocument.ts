import { UuidIdentifierProvider } from "@/server/shared/infra/providers/identifier/uuid-identifier-provider";
import { EditalDraftPreviewAgent } from "@/server/shared/infra/providers/ia/agents/edital-draft-preview-agent";
import { OpenAIModel } from "@/server/shared/infra/providers/ia/models/openai-model";
import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { DraftPreviewExtractor } from "../_shared/DraftPreviewExtractor";
import { UploadEditalDocument } from "./UploadEditalDocument";
import { UploadEditalDocumentController } from "./UploadEditalDocumentController";

const CONFIG = {
    vectorCollectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
    draftPreviewModel: process.env.OPENAI_LIGHT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};

export function makeUploadEditalDocument(): UploadEditalDocumentController {
    const draftPreviewExtractor = new DraftPreviewExtractor(
        new DocumentHandlerFileParsingProvider(),
        new EditalDraftPreviewAgent(new OpenAIModel({ model: CONFIG.draftPreviewModel })),
    );

    return new UploadEditalDocumentController(
        new UploadEditalDocument(
            new UuidIdentifierProvider(),
            new CloudflareR2ObjectStorageProvider(),
            new PrismaLicitacaoRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
            draftPreviewExtractor,
            CONFIG,
        ),
    );
}
