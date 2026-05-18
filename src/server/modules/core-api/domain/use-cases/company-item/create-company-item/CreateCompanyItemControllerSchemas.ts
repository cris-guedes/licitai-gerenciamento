/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { CompanyItemSchema, CompanyItemWritableFieldsSchema } from "../_shared/companyItemSchemas";

export const CreateCompanyItemBodySchema = CompanyItemWritableFieldsSchema.extend({
    companyId: z.string().describe("ID da empresa dona do item"),
});

export namespace CreateCompanyItemControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = CreateCompanyItemBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CompanyItemSchema;

    export type Input = z.infer<typeof CreateCompanyItemBodySchema>;
}
