import type { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";

export type EditalAnalysisView = {
    id: string;
    orgId: string;
    companyId: string;
    editalId: string;
    version: number;
    status: string;
    approvedAt: string | null;
    approvedById: string | null;
    editalNumber: string | null;
    portal: string | null;
    sphere: string | null;
    state: string | null;
    object: string | null;
    modality: string | null;
    contractType: string | null;
    editalUrl: string | null;
    estimatedValue: number | null;
    publicationDate: string | null;
    openingDate: string | null;
    proposalDeadline: string | null;
    processNumber: string | null;
    uasg: string | null;
    proposalDeadlineTime: string | null;
    bidInterval: number | null;
    judgmentCriteria: string | null;
    disputeMode: string | null;
    proposalValidityDays: number | null;
    clarificationDeadline: string | null;
    regionality: string | null;
    exclusiveSmallBusiness: boolean | null;
    allowsAdhesion: boolean | null;
    extractedRules: unknown;
    extractedLogistics: unknown;
    extractedRequiredDocuments: unknown;
    extractedManagingAgencies: unknown;
    extractedParticipatingAgencies: unknown;
    documentIds: string[];
    createdAt: string;
    updatedAt: string;
};

export const EditalAnalysisMapper = {
    toView(a: PrismaEditalAnalysisRepository.EditalAnalysisResponse): EditalAnalysisView {
        return {
            id:                         a.id,
            orgId:                      a.orgId,
            companyId:                  a.companyId,
            editalId:                   a.editalId,
            version:                    a.version,
            status:                     a.status,
            approvedAt:                 a.approvedAt?.toISOString() ?? null,
            approvedById:               a.approvedById,
            editalNumber:               a.editalNumber,
            portal:                     a.portal,
            sphere:                     a.sphere,
            state:                      a.state,
            object:                     a.object,
            modality:                   a.modality,
            contractType:               a.contractType,
            editalUrl:                  a.editalUrl,
            estimatedValue:             a.estimatedValue,
            publicationDate:            a.publicationDate?.toISOString() ?? null,
            openingDate:                a.openingDate?.toISOString() ?? null,
            proposalDeadline:           a.proposalDeadline?.toISOString() ?? null,
            processNumber:              a.processNumber,
            uasg:                       a.uasg,
            proposalDeadlineTime:       a.proposalDeadlineTime,
            bidInterval:                a.bidInterval,
            judgmentCriteria:           a.judgmentCriteria,
            disputeMode:                a.disputeMode,
            proposalValidityDays:       a.proposalValidityDays,
            clarificationDeadline:      a.clarificationDeadline?.toISOString() ?? null,
            regionality:                a.regionality,
            exclusiveSmallBusiness:     a.exclusiveSmallBusiness,
            allowsAdhesion:             a.allowsAdhesion,
            extractedRules:             a.extractedRules,
            extractedLogistics:         a.extractedLogistics,
            extractedRequiredDocuments: a.extractedRequiredDocuments,
            extractedManagingAgencies:  a.extractedManagingAgencies,
            extractedParticipatingAgencies: a.extractedParticipatingAgencies,
            documentIds:                a.documents.map((d) => d.documentId),
            createdAt:                  a.createdAt.toISOString(),
            updatedAt:                  a.updatedAt.toISOString(),
        };
    },
};
