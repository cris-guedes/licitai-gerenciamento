import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { QdrantVectorStore } from "@/server/shared/infra/providers/ia/vector/qdrant-vector-store";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { DeleteLicitacaoDraft } from "./DeleteLicitacaoDraft";
import { DeleteLicitacaoDraftController } from "./DeleteLicitacaoDraftController";

const CONFIG = {
    vectorCollectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
};

export function makeDeleteLicitacaoDraft(): DeleteLicitacaoDraftController {
    return new DeleteLicitacaoDraftController(
        new DeleteLicitacaoDraft(
            new PrismaOportunidadeRepository(),
            new CloudflareR2ObjectStorageProvider(),
            new QdrantVectorStore(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
            CONFIG,
        ),
    );
}
