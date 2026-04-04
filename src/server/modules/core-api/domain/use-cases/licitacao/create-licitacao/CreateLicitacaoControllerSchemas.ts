import { z } from "zod";

const EditalSchema = z.object({
    id:                    z.string(),
    orgId:                 z.string(),
    companyId:             z.string(),
    object:                z.string().nullable(),
    modality:              z.string().nullable(),
    contractType:          z.string().nullable(),
    estimatedValue:        z.number().nullable(),
    editalNumber:          z.string().nullable(),
    portal:                z.string().nullable(),
    sphere:                z.string().nullable(),
    state:                 z.string().nullable(),
    editalUrl:             z.string().nullable(),
    publicationDate:       z.coerce.date().nullable(),
    openingDate:           z.coerce.date().nullable(),
    proposalDeadline:      z.coerce.date().nullable(),
    processNumber:         z.string().nullable(),
    uasg:                  z.string().nullable(),
    proposalDeadlineTime:  z.string().nullable(),
    bidInterval:           z.number().nullable(),
    judgmentCriteria:      z.string().nullable(),
    disputeMode:           z.string().nullable(),
    proposalValidityDays:  z.number().nullable(),
    clarificationDeadline: z.coerce.date().nullable(),
    regionality:           z.string().nullable(),
    exclusiveSmallBusiness: z.boolean(),
    allowsAdhesion:         z.boolean(),
    createdAt:             z.coerce.date(),
    updatedAt:             z.coerce.date(),
});

const TenderSchema = z.object({
    id:        z.string(),
    orgId:     z.string(),
    companyId: z.string(),
    editalId:  z.string(),
    status:    z.string().nullable(),
    phase:     z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

const RulesSchema = z.object({
    deliveryDays:    z.number().nullable().optional(),
    acceptanceDays:  z.number().nullable().optional(),
    liquidationDays: z.number().nullable().optional(),
    paymentDays:     z.number().nullable().optional(),
    guaranteeType:   z.string().nullable().optional(),
    guaranteeMonths: z.number().nullable().optional(),
    installation:    z.string().nullable().optional(),
}).optional().nullable();

const LogisticsSchema = z.object({
    agencyCnpj:              z.string().nullable().optional(),
    agencyStateRegistration: z.string().nullable().optional(),
    deliveryLocation:        z.string().nullable().optional(),
    zipCode:                 z.string().nullable().optional(),
    street:                  z.string().nullable().optional(),
    number:                  z.string().nullable().optional(),
    neighborhood:            z.string().nullable().optional(),
    city:                    z.string().nullable().optional(),
    state:                   z.string().nullable().optional(),
    complement:              z.string().nullable().optional(),
    auctioneerName:          z.string().nullable().optional(),
    auctioneerContact:       z.string().nullable().optional(),
    contractManagerName:     z.string().nullable().optional(),
    contractManagerContact:  z.string().nullable().optional(),
    notes:                   z.string().nullable().optional(),
}).optional().nullable();

const AgencyInputSchema = z.object({
    name: z.string(),
    cnpj: z.string().nullable().optional(),
});

const CreateLicitacaoBodySchema = z.object({
    orgId:     z.string().describe("ID da organização"),
    companyId: z.string().describe("ID da empresa"),

    // Dados básicos
    object:         z.string().min(1).describe("Objeto da licitação"),
    modality:       z.string().min(1).describe("Modalidade"),
    contractType:   z.string().nullable().optional(),
    estimatedValue: z.number().nullable().optional(),
    editalNumber:   z.string().nullable().optional(),
    portal:         z.string().nullable().optional(),
    sphere:         z.string().nullable().optional(),
    state:          z.string().nullable().optional(),
    editalUrl:      z.string().nullable().optional(),
    publicationDate:       z.coerce.date().nullable().optional(),
    openingDate:           z.coerce.date().nullable().optional(),
    proposalDeadline:      z.coerce.date().nullable().optional(),

    // Detalhes do pregão
    processNumber:         z.string().nullable().optional(),
    uasg:                  z.string().nullable().optional(),
    proposalDeadlineTime:  z.string().nullable().optional(),
    bidInterval:           z.number().nullable().optional(),
    judgmentCriteria:      z.string().nullable().optional(),
    disputeMode:           z.string().nullable().optional(),
    proposalValidityDays:  z.number().int().nullable().optional(),
    clarificationDeadline: z.coerce.date().nullable().optional(),
    regionality:           z.string().nullable().optional(),
    exclusiveSmallBusiness: z.boolean().optional(),
    allowsAdhesion:         z.boolean().optional(),

    // Subentidades
    rules:                 RulesSchema,
    logistics:             LogisticsSchema,
    requiredDocuments:     z.array(z.string()).optional(),
    managingAgencies:      z.array(AgencyInputSchema).optional(),
    participatingAgencies: z.array(AgencyInputSchema).optional(),
});

const CreateLicitacaoResponseSchema = z.object({
    edital: EditalSchema,
    tender: TenderSchema,
});

export namespace CreateLicitacaoControllerSchemas {
    export const Body     = CreateLicitacaoBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = CreateLicitacaoResponseSchema;

    export type Input = z.infer<typeof Body>;
}

export { EditalSchema, TenderSchema, CreateLicitacaoResponseSchema };
