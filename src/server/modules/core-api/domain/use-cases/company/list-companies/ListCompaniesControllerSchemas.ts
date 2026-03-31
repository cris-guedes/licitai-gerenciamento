import { z } from "zod";
import { CompanyProfileSchema } from "../_shared/companySchemas";

export const ListCompaniesQuerySchema = z.object({
    organizationId: z.string().describe("ID da organização"),
});

export const ListCompaniesResponseSchema = z.object({
    companies: z.array(CompanyProfileSchema).describe("Lista de empresas da organização"),
});

export namespace ListCompaniesControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = z.null();
    export const Query = ListCompaniesQuerySchema;
    export const Params = z.null();
    export const Response = ListCompaniesResponseSchema;

    export type Input = z.infer<typeof ListCompaniesQuerySchema>;
}
