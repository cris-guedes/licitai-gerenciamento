import { z } from "zod";

const TenderSummarySchema = z.object({
    id:     z.string(),
    status: z.string().nullable(),
    phase:  z.string().nullable(),
}).nullable();

export const LicitacaoListItemSchema = z.object({
    id:              z.string(),
    orgId:           z.string(),
    companyId:       z.string(),
    editalNumber:    z.string().nullable(),
    portal:          z.string().nullable(),
    sphere:          z.string().nullable(),
    state:           z.string().nullable(),
    object:          z.string().nullable(),
    modality:        z.string().nullable(),
    contractType:    z.string().nullable(),
    estimatedValue:  z.number().nullable(),
    publicationDate: z.coerce.date().nullable(),
    openingDate:     z.coerce.date().nullable(),
    proposalDeadline: z.coerce.date().nullable(),
    editalUrl:       z.string().nullable(),
    createdAt:       z.coerce.date(),
    updatedAt:       z.coerce.date(),
    tender:          TenderSummarySchema,
});

export const ListLicitacoesResponseSchema = z.object({
    licitacoes: z.array(LicitacaoListItemSchema),
});

export namespace ListLicitacoesControllerSchemas {
    export const Body   = z.null();
    export const Query  = z.object({
        orgId:     z.string().describe("ID da organização"),
        companyId: z.string().describe("ID da empresa"),
    });
    export const Params   = z.null();
    export const Response = ListLicitacoesResponseSchema;

    export type Input = z.infer<typeof Query>;
}
