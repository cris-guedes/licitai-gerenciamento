import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { ApproveEditalAnalysis } from "./ApproveEditalAnalysis";
import { ApproveEditalAnalysisControllerSchemas } from "./ApproveEditalAnalysisControllerSchemas";

interface ApproveEditalAnalysisControllerTypes {
    Body:     ApproveEditalAnalysisControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: ApproveEditalAnalysis.Response;
}

export class ApproveEditalAnalysisController implements Controller<ApproveEditalAnalysisControllerTypes> {
    constructor(private readonly useCase: ApproveEditalAnalysis) {}

    async handle(request: HttpRequest<ApproveEditalAnalysisControllerTypes>): Promise<HttpResponse<ApproveEditalAnalysis.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = ApproveEditalAnalysisControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({ ...body, userId: request.user.id });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso") || error.message?.includes("Unauthorized")) return unauthorized(error);
            return serverError(error);
        }
    }
}
