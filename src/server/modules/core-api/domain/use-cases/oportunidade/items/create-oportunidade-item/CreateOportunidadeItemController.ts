import {
    badRequest,
    Controller,
    HttpRequest,
    HttpResponse,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import type { CreateOportunidadeItem } from "./CreateOportunidadeItem";
import { CreateOportunidadeItemControllerSchemas } from "./CreateOportunidadeItemControllerSchemas";
import { z } from "zod";

interface CreateOportunidadeItemControllerTypes {
    Body: CreateOportunidadeItemControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateOportunidadeItemOutput;
}

export class CreateOportunidadeItemController implements Controller<CreateOportunidadeItemControllerTypes> {
    constructor(private readonly useCase: CreateOportunidadeItem) { }

    async handle(
        request: HttpRequest<CreateOportunidadeItemControllerTypes>,
    ): Promise<HttpResponse<CreateOportunidadeItemControllerTypes["Response"]>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const payload = CreateOportunidadeItemControllerSchemas.Body.parse(request.body);

            const record = await this.useCase.execute({
                companyId: payload.companyId,
                oportunidadeId: payload.oportunidadeId,
                data: {
                    ...payload.data,
                    numeroItem: toNullableNumber(payload.data.numeroItem, "número do item"),
                    quantidadeTotal: toNullableNumber(payload.data.quantidadeTotal, "quantidade total"),
                    valorUnitarioEstimado: toNullableNumber(payload.data.valorUnitarioEstimado, "valor unitário estimado"),
                    valorTotalEstimado: toNullableNumber(payload.data.valorTotalEstimado, "valor total estimado"),
                },
            });

            return ok(record);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("inválido")) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}

type CreateOportunidadeItemOutput = Awaited<ReturnType<CreateOportunidadeItem["execute"]>>;

function toNullableNumber(value: string | number | null | undefined, fieldName: string) {
    if (value === null || value === undefined || value === "") return null;

    const normalized = typeof value === "string" && value.includes(",")
        ? value.replace(/\./g, "").replace(",", ".")
        : value;
    const parsed = Number(normalized);

    if (!Number.isFinite(parsed)) {
        throw new Error(`Valor inválido para ${fieldName}.`);
    }

    return parsed;
}
