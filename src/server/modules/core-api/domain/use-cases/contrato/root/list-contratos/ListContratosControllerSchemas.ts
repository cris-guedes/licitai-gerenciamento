import { z } from "zod";
import { ContratoResponseSchema } from "../create-contrato/CreateContratoControllerSchemas";

export const ListContratosInputSchema = z.object({
    companyId: z.string().describe("ID da empresa (passado pelo frontend)"),
    oportunidadeId: z.string().optional().describe("Filtrar por ID da Oportunidade"),
});

export const ListContratosResponseSchema = z.object({
    data: z.array(ContratoResponseSchema).describe("Lista de contratos"),
    totalRegistros: z.number().describe("Total de resultados"),
});

export namespace ListContratosControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = z.null();
    export const Query  = ListContratosInputSchema;
    export const Params = z.null();

    export const Response = ListContratosResponseSchema;

    export type Input = z.infer<typeof ListContratosInputSchema>;
}
