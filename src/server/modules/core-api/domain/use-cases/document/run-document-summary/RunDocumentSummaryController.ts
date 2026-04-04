import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { RunDocumentSummary } from "./RunDocumentSummary";
import { RunDocumentSummaryControllerSchemas } from "./RunDocumentSummaryControllerSchemas";

interface RunDocumentSummaryControllerTypes {
    Body:     RunDocumentSummaryControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: RunDocumentSummary.Response;
}

export class RunDocumentSummaryController implements Controller<RunDocumentSummaryControllerTypes> {
    constructor(private readonly useCase: RunDocumentSummary) {}

    async handle(request: HttpRequest<RunDocumentSummaryControllerTypes>): Promise<HttpResponse<RunDocumentSummary.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = RunDocumentSummaryControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({ ...body, userId: request.user.id });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
