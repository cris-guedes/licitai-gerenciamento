import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { GetDocumentSummary } from "./GetDocumentSummary";
import { GetDocumentSummaryController } from "./GetDocumentSummaryController";

export function makeGetDocumentSummary() {
    const useCase = new GetDocumentSummary(
        new PrismaDocumentAnalysisRepository(),
        new PrismaDocumentRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new GetDocumentSummaryController(useCase);
}
