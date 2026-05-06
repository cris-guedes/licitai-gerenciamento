import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { GetLicitacaoWorkspace } from "./GetLicitacaoWorkspace";
import { GetLicitacaoWorkspaceController } from "./GetLicitacaoWorkspaceController";

export function makeGetLicitacaoWorkspace() {
    const useCase = new GetLicitacaoWorkspace(
        new PrismaLicitacaoRepository(),
        new PrismaDocumentAnalysisRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
        new CloudflareR2ObjectStorageProvider(),
    );

    return new GetLicitacaoWorkspaceController(useCase);
}
