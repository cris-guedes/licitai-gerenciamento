/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentAnalysisType } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { LicitacaoWorkspaceViewMapper } from "../_shared/licitacaoWorkspaceView";
import type { GetLicitacaoWorkspaceDTO } from "./dtos/GetLicitacaoWorkspaceDTOs";
import type { GetLicitacaoWorkspaceView } from "./dtos/GetLicitacaoWorkspaceView";

export class GetLicitacaoWorkspace {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly documentAnalysisRepository: PrismaDocumentAnalysisRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly objectStorageProvider: CloudflareR2ObjectStorageProvider,
    ) {}

    async execute(params: GetLicitacaoWorkspace.Params): Promise<GetLicitacaoWorkspace.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workspace = await this.oportunidadeRepository.findWorkspaceById({
            oportunidadeId: params.oportunidadeId,
            companyId: params.companyId,
        });

        if (!workspace || workspace.status !== "DRAFT") {
            return null;
        }

        const documents = workspace.edital?.documents ?? [];
        const documentIds = documents.map(document => document.id);
        const analyses = await this.documentAnalysisRepository.findLatestByDocumentIds({
            documentIds,
            types: [DocumentAnalysisType.EXTRACT_EDITAL, DocumentAnalysisType.SUMMARY],
        });

        const analysesByDocumentId = new Map<string, typeof analyses>();
        for (const analysis of analyses) {
            const current = analysesByDocumentId.get(analysis.documentId) ?? [];
            current.push(analysis);
            analysesByDocumentId.set(analysis.documentId, current);
        }

        const urlsByDocumentId = new Map<string, { documentUrl: string; previewUrlExpiresAt: Date }>();
        for (const document of documents) {
            const temporaryUrl = await this.objectStorageProvider.getDocumentTemporaryUrl({
                key: document.storageKey,
                bucket: document.storageBucket,
                filename: document.originalName,
                contentType: document.mimeType,
            });

            urlsByDocumentId.set(document.id, {
                documentUrl: temporaryUrl.url,
                previewUrlExpiresAt: temporaryUrl.expiresAt,
            });
        }

        return LicitacaoWorkspaceViewMapper.toWorkspaceView({
            workspace,
            analysesByDocumentId,
            urlsByDocumentId,
        });
    }
}

export namespace GetLicitacaoWorkspace {
    export type Params = GetLicitacaoWorkspaceDTO;
    export type Response = GetLicitacaoWorkspaceView | null;
}
