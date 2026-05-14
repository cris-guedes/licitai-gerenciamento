import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { GetDocumentWorkspace } from "./GetDocumentWorkspace";
import { GetDocumentWorkspaceController } from "./GetDocumentWorkspaceController";

export function makeGetDocumentWorkspace() {
    const useCase = new GetDocumentWorkspace(
        new PrismaDocumentRepository(),
        new PrismaDocumentAnalysisRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
        new CloudflareR2ObjectStorageProvider(),
    );

    return new GetDocumentWorkspaceController(useCase);
}
