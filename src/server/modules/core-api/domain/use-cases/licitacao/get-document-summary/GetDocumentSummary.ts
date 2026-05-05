/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentAnalysisStatus, DocumentAnalysisType } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessDocument } from "../_shared/assertDocumentAccess";
import { DocumentSummaryViewMapper } from "../_shared/documentSummaryView";
import type { GetDocumentSummaryDTO } from "./dtos/GetDocumentSummaryDTOs";
import type { GetDocumentSummaryView } from "./dtos/GetDocumentSummaryView";

export class GetDocumentSummary {
    constructor(
        private readonly documentAnalysisRepository: PrismaDocumentAnalysisRepository,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: GetDocumentSummary.Params): Promise<GetDocumentSummary.Response> {
        const { document } = await assertUserCanAccessDocument({
            documentRepository: this.documentRepository,
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            documentId: params.documentId,
            userId: params.userId,
        });

        const analysis = await this.documentAnalysisRepository.findLatestByDocumentAndType({
            documentId: document.id,
            type: DocumentAnalysisType.SUMMARY,
            status: DocumentAnalysisStatus.COMPLETED,
        });

        if (!analysis) {
            return null;
        }

        return DocumentSummaryViewMapper.fromAnalysisResult(analysis.result);
    }
}

export namespace GetDocumentSummary {
    export type Params = GetDocumentSummaryDTO;
    export type Response = GetDocumentSummaryView | null;
}
