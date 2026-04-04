import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { ListEditalAnalyses } from "./ListEditalAnalyses";
import { ListEditalAnalysesControllerSchemas } from "./ListEditalAnalysesControllerSchemas";

interface ListEditalAnalysesControllerTypes {
    Body:     null;
    Query:    ListEditalAnalysesControllerSchemas.Input;
    Params:   null;
    Response: ListEditalAnalyses.Response;
}

export class ListEditalAnalysesController implements Controller<ListEditalAnalysesControllerTypes> {
    constructor(private readonly useCase: ListEditalAnalyses) {}

    async handle(request: HttpRequest<ListEditalAnalysesControllerTypes>): Promise<HttpResponse<ListEditalAnalyses.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = ListEditalAnalysesControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({ ...query, userId: request.user.id });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
