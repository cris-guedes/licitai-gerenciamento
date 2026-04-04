import { z } from "zod";
import { EditalAnalysisResponseSchema } from "../run-edital-analysis/RunEditalAnalysisControllerSchemas";

const ListEditalAnalysesQuerySchema = z.object({
    orgId:    z.string().describe("ID da organização"),
    editalId: z.string().describe("ID do edital"),
});

const ListEditalAnalysesResponseSchema = z.object({
    analyses: z.array(EditalAnalysisResponseSchema),
});

export namespace ListEditalAnalysesControllerSchemas {
    export const Body     = z.null();
    export const Query    = ListEditalAnalysesQuerySchema;
    export const Params   = z.null();
    export const Response = ListEditalAnalysesResponseSchema;

    export type Input = z.infer<typeof Query>;
}

export { ListEditalAnalysesResponseSchema };
