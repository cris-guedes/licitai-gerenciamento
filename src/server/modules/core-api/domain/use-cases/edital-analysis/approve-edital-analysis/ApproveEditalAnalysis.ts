import { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { EditalAnalysisMapper, type EditalAnalysisView } from "../run-edital-analysis/dtos/RunEditalAnalysisView";
import { prisma } from "@/server/shared/infra/db/client";

type ExtractedRules = {
    deliveryDays?: number | null;
    acceptanceDays?: number | null;
    liquidationDays?: number | null;
    paymentDays?: number | null;
    guaranteeType?: string | null;
    guaranteeMonths?: number | null;
    installation?: boolean | null;
};

export class ApproveEditalAnalysis {
    constructor(
        private readonly editalAnalysisRepository: PrismaEditalAnalysisRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ApproveEditalAnalysis.Params): Promise<ApproveEditalAnalysis.Response> {
        const analysis = await this.editalAnalysisRepository.findById(params.editalAnalysisId);
        if (!analysis) throw new Error("Análise não encontrada");
        if (analysis.status === "approved") throw new Error("Análise já foi aprovada");

        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: analysis.orgId,
        });

        await prisma.$transaction(async (tx) => {
            // 1. Update canonical Edital
            await tx.edital.update({
                where: { id: analysis.editalId },
                data: {
                    editalNumber:          analysis.editalNumber,
                    portal:                analysis.portal,
                    sphere:                analysis.sphere,
                    state:                 analysis.state,
                    object:                analysis.object,
                    modality:              analysis.modality,
                    contractType:          analysis.contractType,
                    editalUrl:             analysis.editalUrl,
                    estimatedValue:        analysis.estimatedValue,
                    publicationDate:       analysis.publicationDate,
                    openingDate:           analysis.openingDate,
                    proposalDeadline:      analysis.proposalDeadline,
                    processNumber:         analysis.processNumber,
                    uasg:                  analysis.uasg,
                    proposalDeadlineTime:  analysis.proposalDeadlineTime,
                    bidInterval:           analysis.bidInterval,
                    judgmentCriteria:      analysis.judgmentCriteria,
                    disputeMode:           analysis.disputeMode,
                    proposalValidityDays:  analysis.proposalValidityDays,
                    clarificationDeadline: analysis.clarificationDeadline,
                    regionality:           analysis.regionality,
                    exclusiveSmallBusiness: analysis.exclusiveSmallBusiness ?? false,
                    allowsAdhesion:         analysis.allowsAdhesion ?? false,
                },
            });

            // 2. Upsert EditalRules
            const rules = analysis.extractedRules as ExtractedRules | null;
            if (rules) {
                await tx.editalRules.upsert({
                    where:  { editalId: analysis.editalId },
                    create: { editalId: analysis.editalId, ...rules, installation: rules.installation ? "Obrigatória" : null },
                    update: { ...rules, installation: rules.installation ? "Obrigatória" : null },
                });
            }

            // 3. Create EditalRequiredDocuments (skip duplicates)
            const docs = analysis.extractedRequiredDocuments as string[] | null;
            if (Array.isArray(docs) && docs.length > 0) {
                await tx.editalRequiredDocument.createMany({
                    data:           docs.map((documentType) => ({ editalId: analysis.editalId, documentType })),
                    skipDuplicates: true,
                });
            }
        });

        // 4. Mark analysis as approved
        const updated = await this.editalAnalysisRepository.update(params.editalAnalysisId, {
            status:      "approved",
            approvedAt:  new Date(),
            approvedById: params.userId,
        });

        return EditalAnalysisMapper.toView(updated);
    }
}

export namespace ApproveEditalAnalysis {
    export type Params = { editalAnalysisId: string; userId: string };
    export type Response = EditalAnalysisView;
}
