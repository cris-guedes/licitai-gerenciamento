import { z } from "zod";
import { ContratoResponseSchema } from "../create-contrato/CreateContratoControllerSchemas";

export const UpdateContratoInputSchema = z.object({
    companyId: z.string().describe("ID da empresa"),
    contratoId: z.string().describe("ID do contrato"),

    numeroContrato: z.string().nullable().optional(),
    anoContrato: z.coerce.number().nullable().optional(),
    processo: z.string().nullable().optional(),
    tipoContrato: z.string().nullable().optional(),
    objetoContrato: z.string().nullable().optional(),

    dataAssinatura: z.string().nullable().optional(),
    dataVigenciaInicio: z.string().nullable().optional(),
    dataVigenciaFim: z.string().nullable().optional(),

    fornecedorCnpjCpf: z.string().nullable().optional(),
    fornecedorNome: z.string().nullable().optional(),

    valorInicial: z.coerce.number().nullable().optional(),
    valorGlobal: z.coerce.number().nullable().optional(),
    valorTotal: z.coerce.number().nullable().optional(),
    status: z.enum(["RASCUNHO", "VIGENTE", "ENCERRADO", "RESCINDIDO", "CANCELADO"]).optional(),
});

export namespace UpdateContratoControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = UpdateContratoInputSchema;
    export const Query = z.null();
    export const Params = z.null();

    export const Response = ContratoResponseSchema;

    export type Input = z.infer<typeof Body>;
}
