import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { SearchPublicProcurementsControllerSchemas } from "./SearchPublicProcurementsControllerSchemas";
import { SearchPublicProcurements, type SearchPublicProcurementsParams, type SearchPublicProcurementsResponse } from "./SearchPublicProcurements";
import { z } from "zod";

interface SearchPublicProcurementsControllerTypes {
    Body:     undefined;
    Query:    SearchPublicProcurementsParams;
    Params:   undefined;
    Response: SearchPublicProcurementsResponse;
}

export class SearchPublicProcurementsController implements Controller<SearchPublicProcurementsControllerTypes> {
    constructor(private readonly useCase: SearchPublicProcurements) {}

    async handle(request: HttpRequest<SearchPublicProcurementsControllerTypes>): Promise<HttpResponse<SearchPublicProcurementsResponse>> {
        try {
            const params = SearchPublicProcurementsControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute(params);
            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
