import { z } from "zod";

const EditalAnalysisResponseSchema = z.object({
    id:                         z.string(),
    orgId:                      z.string(),
    companyId:                  z.string(),
    editalId:                   z.string(),
    version:                    z.number(),
    status:                     z.string(),
    approvedAt:                 z.string().nullable(),
    approvedById:               z.string().nullable(),
    editalNumber:               z.string().nullable(),
    portal:                     z.string().nullable(),
    sphere:                     z.string().nullable(),
    state:                      z.string().nullable(),
    object:                     z.string().nullable(),
    modality:                   z.string().nullable(),
    contractType:               z.string().nullable(),
    editalUrl:                  z.string().nullable(),
    estimatedValue:             z.number().nullable(),
    publicationDate:            z.string().nullable(),
    openingDate:                z.string().nullable(),
    proposalDeadline:           z.string().nullable(),
    processNumber:              z.string().nullable(),
    uasg:                       z.string().nullable(),
    proposalDeadlineTime:       z.string().nullable(),
    bidInterval:                z.number().nullable(),
    judgmentCriteria:           z.string().nullable(),
    disputeMode:                z.string().nullable(),
    proposalValidityDays:       z.number().nullable(),
    clarificationDeadline:      z.string().nullable(),
    regionality:                z.string().nullable(),
    exclusiveSmallBusiness:     z.boolean().nullable(),
    allowsAdhesion:             z.boolean().nullable(),
    extractedRules:             z.unknown().nullable(),
    extractedLogistics:         z.unknown().nullable(),
    extractedRequiredDocuments: z.unknown().nullable(),
    extractedManagingAgencies:  z.unknown().nullable(),
    extractedParticipatingAgencies: z.unknown().nullable(),
    documentIds:                z.array(z.string()),
    createdAt:                  z.string(),
    updatedAt:                  z.string(),
});

const RunEditalAnalysisBodySchema = z.object({
    orgId:       z.string().describe("ID da organização"),
    companyId:   z.string().describe("ID da empresa"),
    editalId:    z.string().describe("ID do edital a analisar"),
    documentIds: z.array(z.string()).min(1).describe("IDs dos documentos a usar na análise"),
});

export namespace RunEditalAnalysisControllerSchemas {
    export const Body     = RunEditalAnalysisBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = EditalAnalysisResponseSchema;

    export type Input = z.infer<typeof Body>;
}

export { EditalAnalysisResponseSchema };
