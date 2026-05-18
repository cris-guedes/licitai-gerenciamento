import { z } from "zod";

export const CreateOportunidadeItemPayloadSchema = z.object({
    companyId: z.string().min(1),
    oportunidadeId: z.string().min(1),
    data: z.object({
        numeroItem: z.union([z.number(), z.string()]).nullish().transform(v => (v === null || v === "" || v === undefined ? null : Number(v))),
        descricao: z.string().nullish(),
        quantidadeTotal: z.union([z.number(), z.string()]).nullish().transform(v => (v === null || v === "" || v === undefined ? null : Number(v))),
        valorUnitarioEstimado: z.union([z.number(), z.string()]).nullish().transform(v => (v === null || v === "" || v === undefined ? null : Number(v))),
        valorTotalEstimado: z.union([z.number(), z.string()]).nullish().transform(v => (v === null || v === "" || v === undefined ? null : Number(v))),
        unidadeMedida: z.string().nullish(),
    }),
});

export const CreateOportunidadeItemResponseSchema = z.object({
    item: z.any(), // PrismaOportunidadeRepository.OportunidadeItemRecord
});

export const CreateOportunidadeItemControllerSchemas = {
    Body: CreateOportunidadeItemPayloadSchema,
    Query: z.null(),
    Response: CreateOportunidadeItemResponseSchema,
};
