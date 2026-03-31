import { z } from "zod";
import { CompanyProfileSchema, CompanyWritableFieldsSchema } from "../_shared/companySchemas";

export const CreateCompanyBodySchema = CompanyWritableFieldsSchema.extend({
    organizationId: z.string().describe("ID da organização dona da empresa"),
    cnpj: z.string().describe("CNPJ da empresa"),
    razao_social: z.string().describe("Razão social da empresa"),
});

export namespace CreateCompanyControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = CreateCompanyBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CompanyProfileSchema;

    export type Input = z.infer<typeof CreateCompanyBodySchema>;
}
