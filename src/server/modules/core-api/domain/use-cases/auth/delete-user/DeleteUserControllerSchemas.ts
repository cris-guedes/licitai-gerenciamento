import { z } from "zod";

export const DeleteUserInputSchema = z.object({
  id: z.string().describe("ID do usuário"),
});

export const DeleteUserResponseSchema = z.object({
  id: z.string().describe("ID do usuário"),
  email: z.string().email().describe("E-mail do usuário"),
  password: z.string().nullable().optional().describe("Hash da senha"),
  name: z.string().describe("Nome completo"),
  emailVerified: z.boolean().describe("Se o e-mail foi verificado"),
  image: z.string().nullable().optional().describe("URL da imagem do perfil"),
  createdAt: z.date().describe("Data de criação"),
  updatedAt: z.date().describe("Data de atualização"),
});

export namespace DeleteUserControllerSchemas {
  export const Headers = z.object({
    authorization: z.string().optional(),
  }).optional();

  export const Body = DeleteUserInputSchema;
  export const Query = z.null();
  export const Params = z.null();
  export const Response = DeleteUserResponseSchema;

  export type Input = z.infer<typeof DeleteUserInputSchema>;
}
