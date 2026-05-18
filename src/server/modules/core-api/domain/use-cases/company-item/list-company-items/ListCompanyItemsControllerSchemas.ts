/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { CompanyItemSchema } from "../_shared/companyItemSchemas";

export const ListCompanyItemsQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa dona dos itens"),
});

export const ListCompanyItemsResponseSchema = z.object({
    companyItems: z.array(CompanyItemSchema).describe("Lista de itens cadastrados para a empresa"),
});

export namespace ListCompanyItemsControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().describe("Bearer token do usuário autenticado"),
    });

    export const Body = z.null();
    export const Query = ListCompanyItemsQuerySchema;
    export const Params = z.null();
    export const Response = ListCompanyItemsResponseSchema;

    export type Input = z.infer<typeof ListCompanyItemsQuerySchema>;
}
