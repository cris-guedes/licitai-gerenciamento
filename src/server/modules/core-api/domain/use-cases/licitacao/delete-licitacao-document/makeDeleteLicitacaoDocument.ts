import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { QdrantVectorStore } from "@/server/shared/infra/providers/ia/vector/qdrant-vector-store";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { DeleteLicitacaoDocument } from "./DeleteLicitacaoDocument";
import { DeleteLicitacaoDocumentController } from "./DeleteLicitacaoDocumentController";

const CONFIG = {
    vectorCollectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
};

export function makeDeleteLicitacaoDocument(): DeleteLicitacaoDocumentController {
    return new DeleteLicitacaoDocumentController(
        new DeleteLicitacaoDocument(
            new PrismaDocumentRepository(),
            new CloudflareR2ObjectStorageProvider(),
            new QdrantVectorStore(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
            CONFIG,
        ),
    );
}
