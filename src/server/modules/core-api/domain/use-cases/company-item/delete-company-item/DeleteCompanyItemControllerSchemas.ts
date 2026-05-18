/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { CompanyItemSchema } from "../_shared/companyItemSchemas";

export const DeleteCompanyItemBodySchema = z.object({
    companyId: z.string().describe("ID da empresa dona do item"),
    companyItemId: z.string().describe("ID do item a ser removido"),
});

export namespace DeleteCompanyItemControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = DeleteCompanyItemBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CompanyItemSchema;

    export type Input = z.infer<typeof DeleteCompanyItemBodySchema>;
}
