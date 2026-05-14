/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { OportunidadeBoardItemSchema } from "../_shared/oportunidadeBoardSchemas";

const nullableTextField = z.string().nullable().optional();
const nullableDateField = z.string().nullable().optional();

const UpdateOportunidadeDetailsBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que será atualizada."),
    numero: nullableTextField.describe("Número do edital/licitação."),
    processo: nullableTextField.describe("Processo administrativo."),
    modalidade: nullableTextField.describe("Modalidade da licitação."),
    orgaoNome: nullableTextField.describe("Nome do órgão exibido para a oportunidade."),
    objetoResumo: nullableTextField.describe("Objeto ou resumo da oportunidade."),
    valorEstimado: z.union([z.string(), z.number()]).nullable().optional().describe("Valor estimado total."),
    dataAbertura: nullableDateField.describe("Data de abertura em ISO ou YYYY-MM-DD."),
    dataEncerramento: nullableDateField.describe("Data de encerramento em ISO ou YYYY-MM-DD."),
}).refine(body =>
    body.numero !== undefined
    || body.processo !== undefined
    || body.modalidade !== undefined
    || body.orgaoNome !== undefined
    || body.objetoResumo !== undefined
    || body.valorEstimado !== undefined
    || body.dataAbertura !== undefined
    || body.dataEncerramento !== undefined,
{
    message: "Informe pelo menos um dado para atualizar a oportunidade.",
});

export namespace UpdateOportunidadeDetailsControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = UpdateOportunidadeDetailsBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        item: OportunidadeBoardItemSchema.describe("Oportunidade atualizada para uso no workspace e board."),
    });

    export type Input = z.infer<typeof UpdateOportunidadeDetailsBodySchema>;
}
