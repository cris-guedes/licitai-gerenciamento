import { z } from "zod";
import { EmpenhoResponseSchema } from "../create-empenho/CreateEmpenhoControllerSchemas";

export const ListEmpenhosResponseSchema = z.object({
    data: z.array(EmpenhoResponseSchema).describe("Lista de notas de empenho do contrato"),
    totalRegistros: z.number().describe("Total de empenhos"),
});

export namespace ListEmpenhosControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = z.null();
    export const Query  = z.object({ 
        companyId: z.string(),
        contratoId: z.string().describe("ID do Contrato"),
    });
    export const Params = z.null();

    export const Response = ListEmpenhosResponseSchema;

    export type Input = z.infer<typeof Query>;
}
