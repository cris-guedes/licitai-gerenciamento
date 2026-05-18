/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { CompanyItemSchema } from "../_shared/companyItemSchemas";

export const FetchCompanyItemByIdQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa dona do item"),
    companyItemId: z.string().describe("ID do item da empresa"),
});

export namespace FetchCompanyItemByIdControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = z.null();
    export const Query = FetchCompanyItemByIdQuerySchema;
    export const Params = z.null();
    export const Response = CompanyItemSchema;

    export type Input = z.infer<typeof FetchCompanyItemByIdQuerySchema>;
}
