/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { normalizeContratoItem } from "../../root/get-contrato-workspace/dtos/GetContratoWorkspaceView";
import type { CreateContratoItemDTO } from "./dtos/CreateContratoItemDTOs";

export class CreateContratoItem {
    constructor(private readonly contratoRepository: PrismaContratoRepository) {}

    async execute(params: CreateContratoItem.Params): Promise<CreateContratoItem.Response> {
        const contrato = await this.contratoRepository.findById({
            id: params.contratoId,
            companyId: params.companyId,
        });

        if (!contrato) {
            const error = new Error("Contrato não encontrado") as Error & { statusCode: number };
            error.statusCode = 404;
            throw error;
        }

        const oportunidadeItem = await this.contratoRepository.findOpportunityItemForContrato({
            companyId: params.companyId,
            contratoId: params.contratoId,
            oportunidadeItemId: params.oportunidadeItemId,
        });

        if (!oportunidadeItem) {
            const error = new Error("Item não pertence à oportunidade deste contrato") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        if (oportunidadeItem.isSelected === false) {
            const error = new Error("Apenas itens ativos/selecionados da oportunidade podem ser vinculados ao contrato") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        const existing = await this.contratoRepository.findItemByOpportunityItem({
            companyId: params.companyId,
            contratoId: params.contratoId,
            oportunidadeItemId: params.oportunidadeItemId,
        });

        if (existing) {
            const error = new Error("Este item já está vinculado ao contrato") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        const quantidadeContratada = normalizeNumber(
            params.quantidadeContratada,
            "quantidade contratada",
            toNumber(oportunidadeItem.pricing?.quantidadeCotada) ?? toNumber(oportunidadeItem.editalItem?.quantidadeTotal),
            4,
        );
        const valorUnitario = normalizeNumber(
            params.valorUnitario,
            "valor unitário",
            toNumber(oportunidadeItem.pricing?.precoOfertaUnitario) ?? toNumber(oportunidadeItem.editalItem?.valorUnitarioEstimado),
        );
        const valorTotal = normalizeNumber(
            params.valorTotal,
            "valor total",
            quantidadeContratada !== null && valorUnitario !== null
                ? roundNumber(quantidadeContratada * valorUnitario, 2)
                : toNumber(oportunidadeItem.pricing?.precoOfertaTotal) ?? toNumber(oportunidadeItem.editalItem?.valorTotalEstimado),
        );

        const item = await this.contratoRepository.createItem({
            contratoId: params.contratoId,
            oportunidadeItemId: params.oportunidadeItemId,
            quantidadeContratada,
            valorUnitario,
            valorTotal,
        });

        return {
            item: normalizeContratoItem(item),
        };
    }
}

export namespace CreateContratoItem {
    export type Params = CreateContratoItemDTO;
    export type Response = {
        item: ReturnType<typeof normalizeContratoItem>;
    };
}

function normalizeNumber(
    value: number | null | undefined,
    label: string,
    fallback: number | null,
    maxFractionDigits = 2,
) {
    if (value === undefined || value === null) return fallback;
    if (!Number.isFinite(value) || value < 0) {
        const error = new Error(`Valor de ${label} inválido`) as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    return roundNumber(value, maxFractionDigits);
}

function toNumber(value: unknown) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value: number, fractionDigits: number) {
    return Number(value.toFixed(fractionDigits));
}
