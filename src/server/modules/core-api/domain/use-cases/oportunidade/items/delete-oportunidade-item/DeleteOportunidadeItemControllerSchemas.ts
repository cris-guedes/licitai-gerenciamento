import { z } from "zod";

export const DeleteOportunidadeItemPayloadSchema = z.object({
    companyId: z.string().min(1),
    oportunidadeId: z.string().min(1),
    oportunidadeItemId: z.string().min(1),
});

export const DeleteOportunidadeItemResponseSchema = z.object({
    oportunidadeItemId: z.string(),
});

export const DeleteOportunidadeItemControllerSchemas = {
    Body: DeleteOportunidadeItemPayloadSchema,
    Query: z.null(),
    Response: DeleteOportunidadeItemResponseSchema,
};
