/* eslint-disable @typescript-eslint/no-namespace */
import { EditalItemTipo, OportunidadeItemStatus, OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../../company/_shared/assertCompanyAccess";
import { LicitacaoWorkspaceViewMapper } from "../../../licitacao/_shared/licitacaoWorkspaceView";
import type { UpdateOportunidadeItemDTO } from "./dtos/UpdateOportunidadeItemDTOs";
import type { UpdateOportunidadeItemView } from "./dtos/UpdateOportunidadeItemView";

type CompanyItemRecord = Awaited<ReturnType<PrismaCompanyItemRepository["findById"]>>;

export class UpdateOportunidadeItem {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyItemRepository: PrismaCompanyItemRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateOportunidadeItem.Params): Promise<UpdateOportunidadeItem.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const oportunidadeItem = await this.oportunidadeRepository.findItemById({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            oportunidadeItemId: params.oportunidadeItemId,
        });

        if (!oportunidadeItem) {
            throw new Error("Item da oportunidade não encontrado.");
        }

        const oportunidade = await this.oportunidadeRepository.findById({
            id: oportunidadeItem.oportunidadeId,
            companyId: params.companyId,
        });

        if (!oportunidade) {
            throw new Error("Oportunidade não encontrada.");
        }

        if (oportunidade.status !== OportunidadeStatus.ACTIVE) {
            throw new Error("Somente oportunidades ativas podem ter itens de precificação editados.");
        }

        const companyItem = await this.resolveCompanyItem(params, oportunidadeItem.companyItemId);
        const normalized = this.normalizeUpdateData({
            data: params.data,
            oportunidadeItem,
            companyItem,
        });

        const updated = await this.oportunidadeRepository.updateItemManagement({
            oportunidadeItemId: oportunidadeItem.id,
            data: normalized,
        });

        return {
            item: LicitacaoWorkspaceViewMapper.toManagedItemView(updated),
        };
    }

    private async resolveCompanyItem(
        params: UpdateOportunidadeItem.Params,
        currentCompanyItemId: string | null,
    ): Promise<NonNullable<CompanyItemRecord> | null> {
        const nextCompanyItemId = params.data.companyItemId === undefined
            ? currentCompanyItemId
            : params.data.companyItemId;

        if (!nextCompanyItemId) return null;

        const companyItem = await this.companyItemRepository.findById({ id: nextCompanyItemId });
        if (!companyItem || companyItem.companyId !== params.companyId) {
            throw new Error("Item interno da empresa não encontrado.");
        }

        return companyItem;
    }

    private normalizeUpdateData(params: {
        data: UpdateOportunidadeItem.Params["data"];
        oportunidadeItem: NonNullable<Awaited<ReturnType<PrismaOportunidadeRepository["findItemById"]>>>;
        companyItem: NonNullable<CompanyItemRecord> | null;
    }): PrismaOportunidadeRepository.UpdateItemManagementData {
        const { data, oportunidadeItem, companyItem } = params;
        const resolvedCompanyItemId = data.companyItemId === undefined
            ? oportunidadeItem.companyItemId
            : data.companyItemId;
        const resolvedIsSelected = data.isSelected ?? oportunidadeItem.isSelected;

        const pricingPatch = data.pricing ?? {};
        const quantidadeCotada = this.normalizeNumber(
            pricingPatch.quantidadeCotada,
            "quantidade cotada",
            oportunidadeItem.pricing?.quantidadeCotada !== null && oportunidadeItem.pricing?.quantidadeCotada !== undefined
                ? Number(oportunidadeItem.pricing.quantidadeCotada)
                : this.toNullableNumber(oportunidadeItem.editalItem.quantidadeTotal),
            4,
        );
        const quantidadeAdesao = this.normalizeNumber(
            pricingPatch.quantidadeAdesao,
            "quantidade de adesão",
            oportunidadeItem.pricing?.quantidadeAdesao !== null && oportunidadeItem.pricing?.quantidadeAdesao !== undefined
                ? Number(oportunidadeItem.pricing.quantidadeAdesao)
                : null,
            4,
        );
        const precoOfertaUnitario = this.normalizeNumber(
            pricingPatch.precoOfertaUnitario,
            "preço ofertado",
            oportunidadeItem.pricing?.precoOfertaUnitario !== null && oportunidadeItem.pricing?.precoOfertaUnitario !== undefined
                ? Number(oportunidadeItem.pricing.precoOfertaUnitario)
                : (companyItem?.precoReferencia ?? null),
        );
        const custoUnitarioSnapshot = this.normalizeNumber(
            pricingPatch.custoUnitarioSnapshot,
            "preço de custo",
            oportunidadeItem.pricing?.custoUnitarioSnapshot !== null && oportunidadeItem.pricing?.custoUnitarioSnapshot !== undefined
                ? Number(oportunidadeItem.pricing.custoUnitarioSnapshot)
                : null,
        );
        const valorMinimoLance = this.normalizeNumber(
            pricingPatch.valorMinimoLance,
            "valor mínimo de lance",
            oportunidadeItem.pricing?.valorMinimoLance !== null && oportunidadeItem.pricing?.valorMinimoLance !== undefined
                ? Number(oportunidadeItem.pricing.valorMinimoLance)
                : null,
        );
        const precoOfertaTotal = quantidadeCotada !== null && precoOfertaUnitario !== null
            ? this.roundCurrency(quantidadeCotada * precoOfertaUnitario)
            : null;

        const pricingDefined = data.pricing !== undefined
            || (data.companyItemId !== undefined && precoOfertaUnitario !== null)
            || oportunidadeItem.pricing !== null;

        const disputaPatch = data.disputa ?? {};
        const disputaDefined = data.disputa !== undefined || oportunidadeItem.disputa !== null;

        const resolvedStatus = data.status
            ? data.status
            : this.deriveStatus({
                isSelected: resolvedIsSelected,
                precoOfertaUnitario,
                currentStatus: oportunidadeItem.status,
            });

        return {
            ...(data.editalItem !== undefined ? { editalItem: this.normalizeEditalItemPatch(data.editalItem) } : {}),
            ...(data.companyItemId !== undefined ? { companyItemId: resolvedCompanyItemId ?? null } : {}),
            ...(data.isSelected !== undefined ? { isSelected: resolvedIsSelected } : {}),
            status: resolvedStatus,
            ...(data.observacaoInterna !== undefined ? { observacaoInterna: this.normalizeText(data.observacaoInterna) } : {}),
            ...(pricingDefined
                ? {
                    pricing: {
                        quantidadeCotada,
                        quantidadeAdesao,
                        precoOfertaUnitario,
                        precoOfertaTotal,
                        custoUnitarioSnapshot,
                        valorMinimoLance,
                        ofertaMarca: this.normalizeText(pricingPatch.ofertaMarca, oportunidadeItem.pricing?.ofertaMarca ?? null),
                        ofertaModelo: this.normalizeText(pricingPatch.ofertaModelo, oportunidadeItem.pricing?.ofertaModelo ?? null),
                        garantiaDescricao: this.normalizeText(pricingPatch.garantiaDescricao, oportunidadeItem.pricing?.garantiaDescricao ?? null),
                    },
                }
                : {}),
            ...(disputaDefined
                ? {
                    disputa: {
                        ultimoLance: this.normalizeNumber(
                            disputaPatch.ultimoLance,
                            "último lance",
                            oportunidadeItem.disputa?.ultimoLance !== null && oportunidadeItem.disputa?.ultimoLance !== undefined
                                ? Number(oportunidadeItem.disputa.ultimoLance)
                                : null,
                        ),
                        dataUltimoLance: this.normalizeDate(
                            disputaPatch.dataUltimoLance,
                            "último lance",
                            oportunidadeItem.disputa?.dataUltimoLance ?? null,
                        ),
                        situacaoDisputa: this.normalizeText(disputaPatch.situacaoDisputa, oportunidadeItem.disputa?.situacaoDisputa ?? null),
                        observacaoOperacional: this.normalizeText(disputaPatch.observacaoOperacional, oportunidadeItem.disputa?.observacaoOperacional ?? null),
                    },
                }
                : {}),
        };
    }

    private normalizeEditalItemPatch(
        patch: NonNullable<UpdateOportunidadeItem.Params["data"]["editalItem"]>,
    ): NonNullable<PrismaOportunidadeRepository.UpdateItemManagementData["editalItem"]> {
        return {
            ...(patch.numeroItem !== undefined
                ? { numeroItem: this.normalizeInteger(patch.numeroItem, "número do item") }
                : {}),
            ...(patch.descricao !== undefined
                ? { descricao: this.normalizePatchText(patch.descricao) }
                : {}),
            ...(patch.tipoItem !== undefined
                ? { tipoItem: patch.tipoItem === null ? null : EditalItemTipo[patch.tipoItem] }
                : {}),
            ...(patch.lote !== undefined
                ? { lote: this.normalizePatchText(patch.lote) }
                : {}),
            ...(patch.quantidadeTotal !== undefined
                ? { quantidadeTotal: this.normalizePatchNumber(patch.quantidadeTotal, "quantidade total", 4) }
                : {}),
            ...(patch.unidadeMedida !== undefined
                ? { unidadeMedida: this.normalizePatchText(patch.unidadeMedida) }
                : {}),
            ...(patch.valorUnitarioEstimado !== undefined
                ? { valorUnitarioEstimado: this.normalizePatchNumber(patch.valorUnitarioEstimado, "valor unitário estimado") }
                : {}),
            ...(patch.valorTotalEstimado !== undefined
                ? { valorTotalEstimado: this.normalizePatchNumber(patch.valorTotalEstimado, "valor total estimado") }
                : {}),
        };
    }

    private deriveStatus(params: {
        isSelected: boolean;
        precoOfertaUnitario: number | null;
        currentStatus: OportunidadeItemStatus;
    }): OportunidadeItemStatus {
        if (!params.isSelected) return OportunidadeItemStatus.DISCARDED;

        if (
            params.currentStatus === OportunidadeItemStatus.IN_BIDDING
            || params.currentStatus === OportunidadeItemStatus.WON
            || params.currentStatus === OportunidadeItemStatus.LOST
        ) {
            return params.currentStatus;
        }

        if (params.precoOfertaUnitario === null) return OportunidadeItemStatus.PENDING_PRICING;
        return OportunidadeItemStatus.READY_FOR_BID;
    }

    private normalizeText(value: string | null | undefined, fallback: string | null = null) {
        if (value === undefined) return fallback;
        if (value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private normalizePatchText(value: string | null | undefined) {
        if (value === undefined || value === null) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private normalizeInteger(value: string | number | null | undefined, label: string) {
        if (value === null || value === undefined || value === "") return null;

        const normalized = typeof value === "number" ? value : this.parseNumberString(value);
        if (!Number.isFinite(normalized) || normalized < 0) {
            throw new Error(`Valor de ${label} inválido.`);
        }

        return Math.trunc(normalized);
    }

    private normalizePatchNumber(
        value: string | number | null | undefined,
        label: string,
        maxFractionDigits = 2,
    ) {
        if (value === null || value === undefined || value === "") return null;

        const normalized = typeof value === "number" ? value : this.parseNumberString(value);
        if (!Number.isFinite(normalized) || normalized < 0) {
            throw new Error(`Valor de ${label} inválido.`);
        }

        return this.roundNumber(normalized, maxFractionDigits);
    }

    private normalizeNumber(
        value: string | number | null | undefined,
        label: string,
        fallback: number | null,
        maxFractionDigits = 2,
    ) {
        if (value === undefined) return fallback;
        if (value === null || value === "") return null;

        const normalized = typeof value === "number" ? value : this.parseNumberString(value);
        if (!Number.isFinite(normalized) || normalized < 0) {
            throw new Error(`Valor de ${label} inválido.`);
        }

        return this.roundNumber(normalized, maxFractionDigits);
    }

    private normalizeDate(value: string | null | undefined, label: string, fallback: Date | null) {
        if (value === undefined) return fallback;
        if (value === null || value.trim() === "") return null;

        const trimmed = value.trim();
        const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
            ? new Date(`${trimmed}T00:00:00.000Z`)
            : new Date(trimmed);

        if (Number.isNaN(date.getTime())) {
            throw new Error(`Data de ${label} inválida.`);
        }

        return date;
    }

    private parseNumberString(value: string) {
        const trimmed = value.trim();
        if (!trimmed) return Number.NaN;
        if (trimmed.includes(",")) return Number(trimmed.replace(/\./g, "").replace(",", "."));
        return Number(trimmed);
    }

    private roundCurrency(value: number) {
        return this.roundNumber(value, 2);
    }

    private roundNumber(value: number, fractionDigits: number) {
        return Number(value.toFixed(fractionDigits));
    }

    private toNullableNumber(value: { toString(): string } | null) {
        if (value === null) return null;
        const parsed = Number(value.toString());
        return Number.isFinite(parsed) ? parsed : null;
    }
}

export namespace UpdateOportunidadeItem {
    export type Params = UpdateOportunidadeItemDTO & { userId: string };
    export type Response = UpdateOportunidadeItemView;
}
