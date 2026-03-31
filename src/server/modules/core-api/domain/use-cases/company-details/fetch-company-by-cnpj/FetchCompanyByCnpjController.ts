import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { FetchCompanyByCnpjControllerSchemas } from "./FetchCompanyByCnpjControllerSchemas";
import { FetchCompanyByCnpj } from "./FetchCompanyByCnpj";
import { z } from "zod";

interface FetchCompanyByCnpjControllerTypes {
    Body:     undefined;
    Query:    FetchCompanyByCnpj.Params;
    Params:   undefined;
    Response: FetchCompanyByCnpj.Response;
}

export class FetchCompanyByCnpjController implements Controller<FetchCompanyByCnpjControllerTypes> {
    constructor(private readonly useCase: FetchCompanyByCnpj) {}

    async handle(request: HttpRequest<FetchCompanyByCnpjControllerTypes>): Promise<HttpResponse<FetchCompanyByCnpj.Response>> {
        try {
            const params = FetchCompanyByCnpjControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute(params);
            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace FetchCompanyByCnpjController {
    export type Types    = FetchCompanyByCnpjControllerTypes;
    export type Query    = FetchCompanyByCnpjControllerTypes['Query'];
    export type Response = FetchCompanyByCnpjControllerTypes['Response'];
}
