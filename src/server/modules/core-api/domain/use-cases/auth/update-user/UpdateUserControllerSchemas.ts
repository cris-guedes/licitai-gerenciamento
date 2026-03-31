import { z } from "zod";

export const UpdateUserInputSchema = z.object({
  id: z.string().describe("ID do usuário"),
  data: z
    .object({
      email: z.string().email().optional().describe("E-mail do usuário"),
      password: z.string().nullable().optional().describe("Hash da senha"),
      name: z.string().optional().describe("Nome completo"),
      emailVerified: z.boolean().optional().describe("Se o e-mail foi verificado"),
      image: z.string().nullable().optional().describe("URL da imagem do perfil"),
    })
    .describe("Campos atualizáveis do usuário"),
});

export const UpdateUserResponseSchema = z.object({
  id: z.string().describe("ID do usuário"),
  email: z.string().email().describe("E-mail do usuário"),
  password: z.string().nullable().optional().describe("Hash da senha"),
  name: z.string().describe("Nome completo"),
  emailVerified: z.boolean().describe("Se o e-mail foi verificado"),
  image: z.string().nullable().optional().describe("URL da imagem do perfil"),
  createdAt: z.date().describe("Data de criação"),
  updatedAt: z.date().describe("Data de atualização"),
});

export namespace UpdateUserControllerSchemas {
  export const Headers = z.object({
    authorization: z.string().optional(),
  }).optional();

  export const Body = UpdateUserInputSchema;
  export const Query = z.null();
  export const Params = z.null();
  export const Response = UpdateUserResponseSchema;

  export type Input = z.infer<typeof UpdateUserInputSchema>;
}
