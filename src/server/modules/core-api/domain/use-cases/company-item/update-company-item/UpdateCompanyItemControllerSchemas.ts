/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { CompanyItemSchema, CompanyItemWritableFieldsSchema } from "../_shared/companyItemSchemas";

export const UpdateCompanyItemBodySchema = z.object({
    companyId: z.string().describe("ID da empresa dona do item"),
    companyItemId: z.string().describe("ID do item a ser atualizado"),
    data: CompanyItemWritableFieldsSchema.partial().describe("Campos editáveis do item"),
});

export namespace UpdateCompanyItemControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = UpdateCompanyItemBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CompanyItemSchema;

    export type Input = z.infer<typeof UpdateCompanyItemBodySchema>;
}
