import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { RunEditalAnalysis } from "./RunEditalAnalysis";
import { RunEditalAnalysisControllerSchemas } from "./RunEditalAnalysisControllerSchemas";

interface RunEditalAnalysisControllerTypes {
    Body:     RunEditalAnalysisControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: RunEditalAnalysis.Response;
}

export class RunEditalAnalysisController implements Controller<RunEditalAnalysisControllerTypes> {
    constructor(private readonly useCase: RunEditalAnalysis) {}

    async handle(request: HttpRequest<RunEditalAnalysisControllerTypes>): Promise<HttpResponse<RunEditalAnalysis.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = RunEditalAnalysisControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({ ...body, userId: request.user.id });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
