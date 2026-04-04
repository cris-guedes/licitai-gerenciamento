import { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { EditalAnalysisMapper, type EditalAnalysisView } from "./dtos/RunEditalAnalysisView";
import type { RunEditalAnalysisDTO } from "./dtos/RunEditalAnalysisDTOs";
import type { AiProvider } from "@/server/shared/infra/providers/ai/AiProvider";
import type { PdfProvider } from "@/server/shared/infra/providers/pdf/PdfProvider";

export class RunEditalAnalysis {
    constructor(
        private readonly editalAnalysisRepository: PrismaEditalAnalysisRepository,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly aiProvider: AiProvider,
        private readonly pdfProvider: PdfProvider,
    ) {}

    async execute(params: RunEditalAnalysis.Params): Promise<RunEditalAnalysis.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const version = await this.editalAnalysisRepository.nextVersion(params.editalId);

        const analysis = await this.editalAnalysisRepository.create({
            orgId:       params.orgId,
            companyId:   params.companyId,
            editalId:    params.editalId,
            version,
            status:      "running",
            documentIds: params.documentIds,
        });

        try {
            const texts: string[] = [];
            for (const docId of params.documentIds) {
                const doc = await this.documentRepository.findById({ id: docId });
                if (!doc) continue;
                const text = await this.pdfProvider.extractTextFromUrl(doc.url);
                texts.push(text);
            }

            const combinedText = texts.join("\n\n---\n\n");
            const extraction = await this.aiProvider.extractEdital(combinedText);

            const updated = await this.editalAnalysisRepository.update(analysis.id, ({
                status:                     "completed",
                editalNumber:               extraction.editalNumber,
                portal:                     extraction.portal,
                sphere:                     extraction.sphere,
                state:                      extraction.state,
                object:                     extraction.object,
                modality:                   extraction.modality,
                contractType:               extraction.contractType,
                editalUrl:                  extraction.editalUrl,
                estimatedValue:             extraction.estimatedValue,
                publicationDate:            extraction.publicationDate ? new Date(extraction.publicationDate) : null,
                openingDate:                extraction.openingDate ? new Date(extraction.openingDate) : null,
                proposalDeadline:           extraction.proposalDeadline ? new Date(extraction.proposalDeadline) : null,
                processNumber:              extraction.processNumber,
                uasg:                       extraction.uasg,
                proposalDeadlineTime:       extraction.proposalDeadlineTime,
                bidInterval:                extraction.bidInterval,
                judgmentCriteria:           extraction.judgmentCriteria,
                disputeMode:                extraction.disputeMode,
                proposalValidityDays:       extraction.proposalValidityDays,
                clarificationDeadline:      extraction.clarificationDeadline ? new Date(extraction.clarificationDeadline) : null,
                regionality:                extraction.regionality,
                exclusiveSmallBusiness:     extraction.exclusiveSmallBusiness,
                allowsAdhesion:             extraction.allowsAdhesion,
                extractedRules:             extraction.extractedRules as any,
                extractedRequiredDocuments: extraction.extractedRequiredDocuments as any,
                extractedManagingAgencies:  extraction.extractedManagingAgencies as any,
                extractedParticipatingAgencies: extraction.extractedParticipatingAgencies as any,
            }) as any);

            return EditalAnalysisMapper.toView(updated);
        } catch (error) {
            await this.editalAnalysisRepository.update(analysis.id, { status: "failed" as any });
            throw error;
        }
    }
}

export namespace RunEditalAnalysis {
    export type Params = RunEditalAnalysisDTO & { userId: string };
    export type Response = EditalAnalysisView;
}
