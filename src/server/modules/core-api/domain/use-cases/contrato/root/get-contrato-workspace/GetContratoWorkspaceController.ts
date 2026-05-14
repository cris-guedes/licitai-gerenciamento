import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { GetContratoWorkspaceControllerSchemas } from "./GetContratoWorkspaceControllerSchemas";
import { GetContratoWorkspace } from "./GetContratoWorkspace";
import { z } from "zod";

interface GetContratoWorkspaceControllerTypes {
    Body: undefined;
    Query: GetContratoWorkspaceControllerSchemas.Input;
    Params: undefined;
    Response: GetContratoWorkspace.Response;
}

export class GetContratoWorkspaceController implements Controller<GetContratoWorkspaceControllerTypes> {
    constructor(private readonly useCase: GetContratoWorkspace) { }

    async handle(request: HttpRequest<GetContratoWorkspaceControllerTypes>): Promise<HttpResponse<GetContratoWorkspace.Response>> {
        try {
            const input = GetContratoWorkspaceControllerSchemas.Query.parse(request.query);

            const result = await this.useCase.execute({
                contratoId: input.contratoId,
                companyId: input.companyId,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            
            if (error.statusCode === 404) {
                return { statusCode: 404, data: { message: error.message } as any };
            }

            return serverError(error);
        }
    }
}

export namespace GetContratoWorkspaceController {
    export type Types = GetContratoWorkspaceControllerTypes;
    export type Params = GetContratoWorkspaceControllerTypes['Params'];
    export type Response = GetContratoWorkspaceControllerTypes['Response'];
}
