/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { LicitacaoWorkspaceTaskSchema } from "../../../licitacao/_shared/licitacaoWorkspaceSchemas";

const ToggleOportunidadeTaskBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade dona da tarefa."),
    taskId: z.string().min(1).describe("ID da tarefa."),
    status: z.enum(["OPEN", "DONE"]).describe("Novo status da tarefa."),
});

export namespace ToggleOportunidadeTaskControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = ToggleOportunidadeTaskBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        task: LicitacaoWorkspaceTaskSchema.describe("Tarefa atualizada."),
    });

    export type Input = z.infer<typeof ToggleOportunidadeTaskBodySchema>;
}
