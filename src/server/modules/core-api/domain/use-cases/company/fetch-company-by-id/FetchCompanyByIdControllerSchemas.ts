import { z } from "zod";
import { CompanyProfileSchema } from "../_shared/companySchemas";

export const FetchCompanyByIdQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa"),
});

export namespace FetchCompanyByIdControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = z.null();
    export const Query = FetchCompanyByIdQuerySchema;
    export const Params = z.null();
    export const Response = CompanyProfileSchema;

    export type Input = z.infer<typeof FetchCompanyByIdQuerySchema>;
}
