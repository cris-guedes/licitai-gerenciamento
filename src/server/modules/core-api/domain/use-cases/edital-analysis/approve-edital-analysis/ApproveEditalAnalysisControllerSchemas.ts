import { z } from "zod";
import { EditalAnalysisResponseSchema } from "../run-edital-analysis/RunEditalAnalysisControllerSchemas";

const ApproveEditalAnalysisBodySchema = z.object({
    editalAnalysisId: z.string().describe("ID da análise a aprovar"),
});

export namespace ApproveEditalAnalysisControllerSchemas {
    export const Body     = ApproveEditalAnalysisBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = EditalAnalysisResponseSchema;

    export type Input = z.infer<typeof Body>;
}
