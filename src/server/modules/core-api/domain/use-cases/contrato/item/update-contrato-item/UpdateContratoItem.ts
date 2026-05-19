/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { normalizeContratoItem } from "../../root/get-contrato-workspace/dtos/GetContratoWorkspaceView";
import type { UpdateContratoItemDTO } from "./dtos/UpdateContratoItemDTOs";

export class UpdateContratoItem {
    constructor(private readonly contratoRepository: PrismaContratoRepository) {}

    async execute(params: UpdateContratoItem.Params): Promise<UpdateContratoItem.Response> {
        const current = await this.contratoRepository.findItemById({
            companyId: params.companyId,
            contratoId: params.contratoId,
            contratoItemId: params.contratoItemId,
        });

        if (!current) {
            const error = new Error("Item do contrato não encontrado") as Error & { statusCode: number };
            error.statusCode = 404;
            throw error;
        }

        const quantidadeEmpenhada = toNumber(current.quantidadeEmpenhada) ?? 0;
        const quantidadeContratada = normalizeOptionalNumber(
            params.quantidadeContratada,
            "quantidade contratada",
            toNumber(current.quantidadeContratada),
            4,
        );
        const valorUnitario = normalizeOptionalNumber(
            params.valorUnitario,
            "valor unitário",
            toNumber(current.valorUnitario),
        );
        const valorTotal = params.valorTotal === undefined
            ? resolveTotal({
                nextQuantity: quantidadeContratada,
                nextUnit: valorUnitario,
                currentTotal: toNumber(current.valorTotal),
                quantityChanged: params.quantidadeContratada !== undefined,
                unitChanged: params.valorUnitario !== undefined,
            })
            : normalizeOptionalNumber(params.valorTotal, "valor total", toNumber(current.valorTotal));

        if (quantidadeContratada === null && quantidadeEmpenhada > 0) {
            const error = new Error("Não é possível remover a quantidade contratada de um item já empenhado") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        if (quantidadeContratada !== null && quantidadeContratada < quantidadeEmpenhada) {
            const error = new Error("A quantidade contratada não pode ser menor que a quantidade já empenhada") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        const item = await this.contratoRepository.updateItem({
            contratoItemId: params.contratoItemId,
            quantidadeContratada,
            valorUnitario,
            valorTotal,
        });

        return {
            item: normalizeContratoItem(item),
        };
    }
}

export namespace UpdateContratoItem {
    export type Params = UpdateContratoItemDTO;
    export type Response = {
        item: ReturnType<typeof normalizeContratoItem>;
    };
}

function normalizeOptionalNumber(
    value: number | null | undefined,
    label: string,
    fallback: number | null,
    maxFractionDigits = 2,
) {
    if (value === undefined) return fallback;
    if (value === null) return null;
    if (!Number.isFinite(value) || value < 0) {
        const error = new Error(`Valor de ${label} inválido`) as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    return roundNumber(value, maxFractionDigits);
}

function resolveTotal(params: {
    nextQuantity: number | null;
    nextUnit: number | null;
    currentTotal: number | null;
    quantityChanged: boolean;
    unitChanged: boolean;
}) {
    if ((params.quantityChanged || params.unitChanged) && params.nextQuantity !== null && params.nextUnit !== null) {
        return roundNumber(params.nextQuantity * params.nextUnit, 2);
    }

    return params.currentTotal;
}

function toNumber(value: unknown) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value: number, fractionDigits: number) {
    return Number(value.toFixed(fractionDigits));
}
