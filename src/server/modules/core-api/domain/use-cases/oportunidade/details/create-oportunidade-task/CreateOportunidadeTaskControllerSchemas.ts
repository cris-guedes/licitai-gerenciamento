/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { LicitacaoWorkspaceTaskSchema } from "../../../licitacao/_shared/licitacaoWorkspaceSchemas";

const CreateOportunidadeTaskBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que receberá a tarefa."),
    title: z.string().min(1).describe("Título objetivo da tarefa."),
    dueAt: z.string().nullable().optional().describe("Prazo opcional em ISO ou YYYY-MM-DD."),
});

export namespace CreateOportunidadeTaskControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = CreateOportunidadeTaskBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        task: LicitacaoWorkspaceTaskSchema.describe("Tarefa criada para a oportunidade."),
    });

    export type Input = z.infer<typeof CreateOportunidadeTaskBodySchema>;
}
