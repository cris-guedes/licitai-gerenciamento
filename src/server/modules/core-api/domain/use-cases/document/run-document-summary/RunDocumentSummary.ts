import { prisma } from "@/server/shared/infra/db/client";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import type { AiProvider } from "@/server/shared/infra/providers/ai/AiProvider";
import type { PdfProvider } from "@/server/shared/infra/providers/pdf/PdfProvider";

const MODEL = "claude-sonnet-4-6";

type AnalysisView = {
    id: string;
    orgId: string;
    companyId: string;
    documentId: string;
    version: number;
    status: string;
    model: string | null;
    summary: string | null;
    createdAt: string;
    updatedAt: string;
};

export class RunDocumentSummary {
    constructor(
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly aiProvider: AiProvider,
        private readonly pdfProvider: PdfProvider,
    ) {}

    async execute(params: RunDocumentSummary.Params): Promise<RunDocumentSummary.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const doc = await this.documentRepository.findById({ id: params.documentId });
        if (!doc) throw new Error("Documento não encontrado");

        const lastVersion = await prisma.analysis.findFirst({
            where: { documentId: params.documentId },
            orderBy: { version: "desc" },
            select: { version: true },
        });
        const version = (lastVersion?.version ?? 0) + 1;

        const analysis = await prisma.analysis.create({
            data: {
                orgId:      params.orgId,
                companyId:  params.companyId,
                documentId: params.documentId,
                version,
                status:     "running",
                model:      MODEL,
            },
        });

        try {
            const text    = await this.pdfProvider.extractTextFromUrl(doc.url);
            const summary = await this.aiProvider.summarizeDocument(text);

            const updated = await prisma.analysis.update({
                where: { id: analysis.id },
                data:  { status: "completed", summary },
            });

            return this.toView(updated);
        } catch (error) {
            await prisma.analysis.update({ where: { id: analysis.id }, data: { status: "failed" } });
            throw error;
        }
    }

    private toView(a: any): AnalysisView {
        return {
            id:         a.id,
            orgId:      a.orgId,
            companyId:  a.companyId,
            documentId: a.documentId,
            version:    a.version,
            status:     a.status,
            model:      a.model,
            summary:    a.summary,
            createdAt:  a.createdAt.toISOString(),
            updatedAt:  a.updatedAt.toISOString(),
        };
    }
}

export namespace RunDocumentSummary {
    export type Params = { orgId: string; companyId: string; documentId: string; userId: string };
    export type Response = AnalysisView;
}
