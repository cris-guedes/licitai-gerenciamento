/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentAnalysisStatus, DocumentAnalysisType, Prisma } from "@prisma/client";
import type { IAgent } from "@/server/modules/core-api/domain/data/IAgent";
import type { DocumentChatSourceView } from "../_shared/documentChatView";
import type { IVectorSearchProvider } from "@/server/modules/core-api/domain/data/IVectorSearchProvider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessDocument } from "../_shared/assertDocumentAccess";
import type { SummarizeDocumentDTO } from "./dtos/SummarizeDocumentDTOs";
import { SummarizeDocumentMapper, type DocumentSummaryStructuredView, type SummarizeDocumentView } from "./dtos/SummarizeDocumentView";
import type {
    DocumentSummaryChunkPayload,
    DocumentSummaryObject,
} from "@/server/shared/infra/providers/ia/agents/document-summary-agent/schemas";

const SEARCH_LIMIT_PER_QUERY = 4;
const MAX_UNIQUE_CHUNKS = 12;
const MIN_SCORE = 0.15;

export class SummarizeDocument {
    constructor(
        private readonly summaryAgent: IAgent<DocumentSummaryChunkPayload[], DocumentSummaryObject>,
        private readonly vectorSearchProvider: IVectorSearchProvider,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly documentAnalysisRepository: PrismaDocumentAnalysisRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: SummarizeDocument.Params): Promise<SummarizeDocument.Response> {
        const { document } = await assertUserCanAccessDocument({
            documentRepository: this.documentRepository,
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            documentId: params.documentId,
            userId: params.userId,
        });

        const analysis = await this.documentAnalysisRepository.create({
            documentId: document.id,
            companyId: document.companyId,
            createdById: params.userId,
            type: DocumentAnalysisType.SUMMARY,
            status: DocumentAnalysisStatus.RUNNING,
            startedAt: new Date(),
        });

        try {
            const chunks = await this.searchRelevantChunks(document.vectorDocumentId);
            const generatedAt = new Date().toISOString();

            const view = chunks.length === 0
                ? SummarizeDocumentMapper.toView({
                    documentId: document.id,
                    generatedAt,
                    summary: this.emptySummary("Não foi possível recuperar trechos suficientes para resumir este documento."),
                    sources: [],
                })
                : await this.buildSummaryView(document.id, generatedAt, chunks);

            await this.documentAnalysisRepository.update({
                id: analysis.id,
                data: {
                    status: DocumentAnalysisStatus.COMPLETED,
                    markdownContent: SummarizeDocumentMapper.toMarkdownContent(view.summary),
                    result: view as Prisma.InputJsonValue,
                    finishedAt: new Date(),
                },
            });

            return view;
        } catch (error) {
            await this.documentAnalysisRepository.update({
                id: analysis.id,
                data: {
                    status: DocumentAnalysisStatus.FAILED,
                    errorMessage: error instanceof Error ? error.message : "Erro ao gerar resumo do documento.",
                    finishedAt: new Date(),
                },
            }).catch(() => undefined);

            throw error;
        }
    }

    private async buildSummaryView(
        documentId: string,
        generatedAt: string,
        chunks: DocumentSummaryChunkPayload[],
    ): Promise<SummarizeDocument.Response> {
        const { data } = await this.summaryAgent.extract(chunks);

        return SummarizeDocumentMapper.toView({
            documentId,
            generatedAt,
            summary: {
                overview: data.overview.trim(),
                keyPoints: this.cleanList(data.keyPoints),
                deadlines: this.cleanList(data.deadlines),
                requirements: this.cleanList(data.requirements),
                risks: this.cleanList(data.risks),
            },
            sources: chunks.map((chunk, index) => this.toSourceView(chunk, generatedAt, index)),
        });
    }

    private async searchRelevantChunks(vectorDocumentId: string): Promise<DocumentSummaryChunkPayload[]> {
        const queries = this.summaryAgent.getSearchQueries();
        const results = await Promise.all(
            queries.map(query => this.vectorSearchProvider.search({
                documentId: vectorDocumentId,
                query,
                limit: SEARCH_LIMIT_PER_QUERY,
                minScore: MIN_SCORE,
            })),
        );

        const uniqueByChunkId = new Map<string, DocumentSummaryChunkPayload>();

        for (const chunks of results) {
            for (const chunk of chunks) {
                const current = uniqueByChunkId.get(chunk.chunkId);
                if (!current || chunk.score > current.score) {
                    uniqueByChunkId.set(chunk.chunkId, {
                        chunkId: chunk.chunkId,
                        content: chunk.content,
                        page: chunk.page ?? null,
                        heading: chunk.heading ?? null,
                        score: chunk.score,
                    });
                }
            }
        }

        return Array.from(uniqueByChunkId.values())
            .sort((left, right) => right.score - left.score)
            .slice(0, MAX_UNIQUE_CHUNKS);
    }

    private toSourceView(
        chunk: DocumentSummaryChunkPayload,
        generatedAt: string,
        index: number,
    ): DocumentChatSourceView {
        return {
            id: `summary-source-${index + 1}-${chunk.chunkId}`,
            chunkId: chunk.chunkId,
            page: chunk.page,
            score: chunk.score,
            snippet: this.buildSnippet(chunk.content),
            heading: chunk.heading,
            createdAt: generatedAt,
        };
    }

    private buildSnippet(content: string) {
        const normalized = content.replace(/\s+/g, " ").trim();
        if (normalized.length <= 280) return normalized;
        return `${normalized.slice(0, 277)}...`;
    }

    private cleanList(items: string[]) {
        return items
            .map(item => item.trim())
            .filter(Boolean);
    }

    private emptySummary(overview: string): DocumentSummaryStructuredView {
        return {
            overview,
            keyPoints: [],
            deadlines: [],
            requirements: [],
            risks: [],
        };
    }
}

export namespace SummarizeDocument {
    export type Params = SummarizeDocumentDTO;
    export type Response = SummarizeDocumentView;
}
