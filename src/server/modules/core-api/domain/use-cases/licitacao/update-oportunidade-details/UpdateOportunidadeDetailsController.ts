import {
    badRequest,
    Controller,
    HttpRequest,
    HttpResponse,
    notFound,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UpdateOportunidadeDetails } from "./UpdateOportunidadeDetails";
import { UpdateOportunidadeDetailsControllerSchemas } from "./UpdateOportunidadeDetailsControllerSchemas";

interface UpdateOportunidadeDetailsControllerTypes {
    Body: UpdateOportunidadeDetailsControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateOportunidadeDetails.Response;
}

export class UpdateOportunidadeDetailsController implements Controller<UpdateOportunidadeDetailsControllerTypes> {
    constructor(private readonly useCase: UpdateOportunidadeDetails) {}

    async handle(
        request: HttpRequest<UpdateOportunidadeDetailsControllerTypes>,
    ): Promise<HttpResponse<UpdateOportunidadeDetails.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = UpdateOportunidadeDetailsControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                numero: body.numero,
                processo: body.processo,
                modalidade: body.modalidade,
                orgaoNome: body.orgaoNome,
                objetoResumo: body.objetoResumo,
                valorEstimado: body.valorEstimado,
                dataAbertura: body.dataAbertura,
                dataEncerramento: body.dataEncerramento,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            if (error instanceof Error && error.message.includes("inválid")) return badRequest(error);
            if (error instanceof Error && error.message.includes("Somente")) return badRequest(error);
            if (error instanceof Error && error.message.includes("ainda não possui")) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
