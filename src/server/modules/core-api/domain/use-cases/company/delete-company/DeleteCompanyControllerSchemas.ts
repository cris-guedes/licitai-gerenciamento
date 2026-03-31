import { z } from "zod";
import { CompanyProfileSchema } from "../_shared/companySchemas";

export const DeleteCompanyBodySchema = z.object({
    companyId: z.string().describe("ID da empresa"),
});

export namespace DeleteCompanyControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = DeleteCompanyBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CompanyProfileSchema;

    export type Input = z.infer<typeof DeleteCompanyBodySchema>;
}
