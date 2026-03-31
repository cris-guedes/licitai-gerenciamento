import { z } from "zod";
import { CompanyProfileSchema, CompanyWritableFieldsSchema } from "../_shared/companySchemas";

export const UpdateCompanyBodySchema = z.object({
    companyId: z.string().describe("ID da empresa"),
    data: CompanyWritableFieldsSchema.partial().describe("Campos da empresa que podem ser atualizados"),
});

export namespace UpdateCompanyControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = UpdateCompanyBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CompanyProfileSchema;

    export type Input = z.infer<typeof UpdateCompanyBodySchema>;
}
