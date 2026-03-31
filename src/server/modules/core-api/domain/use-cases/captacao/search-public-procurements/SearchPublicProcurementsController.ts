import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { SearchPublicProcurementsControllerSchemas } from "./SearchPublicProcurementsControllerSchemas";
import { SearchPublicProcurements } from "./SearchPublicProcurements";
import { z } from "zod";

interface SearchPublicProcurementsControllerTypes {
    Body:     undefined;
    Query:    SearchPublicProcurements.Params;
    Params:   undefined;
    Response: SearchPublicProcurements.Response;
}

export class SearchPublicProcurementsController implements Controller<SearchPublicProcurementsControllerTypes> {
    constructor(private readonly useCase: SearchPublicProcurements) {}

    async handle(request: HttpRequest<SearchPublicProcurementsControllerTypes>): Promise<HttpResponse<SearchPublicProcurements.Response>> {
        try {
            const params = SearchPublicProcurementsControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute(params);
            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace SearchPublicProcurementsController {
    export type Types    = SearchPublicProcurementsControllerTypes;
    export type Query    = SearchPublicProcurementsControllerTypes['Query'];
    export type Response = SearchPublicProcurementsControllerTypes['Response'];
}
