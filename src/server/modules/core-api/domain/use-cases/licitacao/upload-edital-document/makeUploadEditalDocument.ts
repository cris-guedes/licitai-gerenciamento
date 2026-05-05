import { UuidIdentifierProvider } from "@/server/shared/infra/providers/identifier/uuid-identifier-provider";
import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { UploadEditalDocument } from "./UploadEditalDocument";
import { UploadEditalDocumentController } from "./UploadEditalDocumentController";

const CONFIG = {
    vectorCollectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
};

export function makeUploadEditalDocument(): UploadEditalDocumentController {
    return new UploadEditalDocumentController(
        new UploadEditalDocument(
            new UuidIdentifierProvider(),
            new CloudflareR2ObjectStorageProvider(),
            new PrismaLicitacaoRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
            CONFIG,
        ),
    );
}
