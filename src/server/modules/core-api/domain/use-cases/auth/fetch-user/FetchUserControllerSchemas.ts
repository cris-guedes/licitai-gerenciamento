import { z } from "zod";

export const FetchUserInputSchema = z.object({
    field: z.string().describe("Campo para busca: 'id', 'email' ou outro campo do usuário"),
    value: z.string().describe("Valor a ser pesquisado para o campo informado"),
});

export const UserSchema = z.object({
    id:            z.string().describe("Identificador único do usuário"),
    email:         z.string().email().describe("E-mail do usuário"),
    name:          z.string().describe("Nome completo"),
    emailVerified: z.boolean().describe("Se o e-mail foi verificado"),
    image:         z.string().nullable().optional().describe("URL da imagem do perfil"),
    password:      z.string().nullable().optional().describe("Hash da senha (não expor ao cliente público)"),
    createdAt:     z.date().describe("Data de criação"),
    updatedAt:     z.date().describe("Data de atualização"),
});

export namespace FetchUserControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = z.null();

    export const Query = FetchUserInputSchema;

    export const Params = z.null();

    export const Response = UserSchema;

    export type Input = z.infer<typeof FetchUserInputSchema>;
}
