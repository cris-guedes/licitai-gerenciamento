import { z } from "zod";

export const RegisterUserInputSchema = z.object({
    id: z.string().optional().describe("ID do usuário (opcional, gerado pelo sistema)"),
    email: z.string().email().describe("E-mail do usuário"),
    password: z.string().nullable().optional().describe("Hash da senha (opcional)"),
    name: z.string().describe("Nome completo"),
    emailVerified: z.boolean().describe("Se o e-mail foi verificado"),
    image: z.string().nullable().optional().describe("URL da imagem do perfil"),
    createdAt: z.date().optional().describe("Data de criação (opcional)"),
    updatedAt: z.date().optional().describe("Data de atualização (opcional)"),
});

export const RegisterUserResponseSchema = z.object({
    id: z.string().describe("ID do usuário"),
    email: z.string().email().describe("E-mail do usuário"),
    password: z.string().nullable().optional().describe("Hash da senha"),
    name: z.string().describe("Nome completo"),
    emailVerified: z.boolean().describe("Se o e-mail foi verificado"),
    image: z.string().nullable().optional().describe("URL da imagem do perfil"),
    createdAt: z.date().describe("Data de criação"),
    updatedAt: z.date().describe("Data de atualização"),
});

export namespace RegisterUserControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = RegisterUserInputSchema;

    export const Query = z.null();

    export const Params = z.null();

    export const Response = RegisterUserResponseSchema;

    export type Input = z.infer<typeof RegisterUserInputSchema>;
}
