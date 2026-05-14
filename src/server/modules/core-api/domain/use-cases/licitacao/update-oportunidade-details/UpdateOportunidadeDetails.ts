/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { parseLicitacaoDraftPreview, withDraftPreview } from "../_shared/draftPreview";
import { OportunidadeBoardViewMapper } from "../_shared/oportunidadeBoardView";
import type { UpdateOportunidadeDetailsDTO } from "./dtos/UpdateOportunidadeDetailsDTOs";
import type { UpdateOportunidadeDetailsView } from "./dtos/UpdateOportunidadeDetailsView";

export class UpdateOportunidadeDetails {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateOportunidadeDetails.Params): Promise<UpdateOportunidadeDetails.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const oportunidade = await this.oportunidadeRepository.findBoardById({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
        });

        if (!oportunidade) {
            throw new Error("Oportunidade não encontrada.");
        }

        if (oportunidade.status !== OportunidadeStatus.ACTIVE) {
            throw new Error("Somente oportunidades ativas podem ter seus dados editados neste workspace.");
        }

        if (!oportunidade.licitacaoId && !oportunidade.editalId) {
            throw new Error("A oportunidade ainda não possui licitação ou edital vinculado para edição.");
        }

        const data = this.normalizeUpdateData(params);
        const draftPreview = parseLicitacaoDraftPreview(oportunidade.metadata ?? oportunidade.licitacao?.metadados ?? null);
        const metadata = draftPreview ? withDraftPreview(oportunidade.metadata ?? oportunidade.licitacao?.metadados ?? null, {
            ...draftPreview,
            displayName: this.hasField(data, "objetoResumo") ? data.objetoResumo ?? null : draftPreview.displayName,
            orgaoNome: this.hasField(data, "orgaoNome") ? data.orgaoNome ?? null : draftPreview.orgaoNome,
            modalidade: this.hasField(data, "modalidade") ? data.modalidade ?? null : draftPreview.modalidade,
            numero: this.hasField(data, "numero") ? data.numero ?? null : draftPreview.numero,
            objetoResumo: this.hasField(data, "objetoResumo") ? data.objetoResumo ?? null : draftPreview.objetoResumo,
            dataAbertura: this.hasField(data, "dataAbertura")
                ? data.dataAbertura?.toISOString() ?? null
                : draftPreview.dataAbertura,
        }) : undefined;

        const updated = await this.oportunidadeRepository.updateDetails({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            data: {
                ...data,
                metadata,
            },
        });

        return {
            item: OportunidadeBoardViewMapper.toItemView({
                oportunidade: updated,
                currentUserId: params.userId,
            }),
        };
    }

    private normalizeUpdateData(
        params: UpdateOportunidadeDetails.Params,
    ): Omit<PrismaOportunidadeRepository.UpdateDetailsData, "metadata"> {
        return {
            ...(params.numero !== undefined ? { numero: this.normalizeText(params.numero) } : {}),
            ...(params.processo !== undefined ? { processo: this.normalizeText(params.processo) } : {}),
            ...(params.modalidade !== undefined ? { modalidade: this.normalizeText(params.modalidade) } : {}),
            ...(params.orgaoNome !== undefined ? { orgaoNome: this.normalizeText(params.orgaoNome) } : {}),
            ...(params.objetoResumo !== undefined ? { objetoResumo: this.normalizeText(params.objetoResumo) } : {}),
            ...(params.valorEstimado !== undefined ? { valorEstimado: this.normalizeNumber(params.valorEstimado) } : {}),
            ...(params.dataAbertura !== undefined ? { dataAbertura: this.normalizeDate(params.dataAbertura, "abertura") } : {}),
            ...(params.dataEncerramento !== undefined ? { dataEncerramento: this.normalizeDate(params.dataEncerramento, "encerramento") } : {}),
        };
    }

    private normalizeText(value: string | null | undefined) {
        if (value === null || value === undefined) return null;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private normalizeNumber(value: string | number | null | undefined) {
        if (value === null || value === undefined || value === "") return null;
        const normalized = typeof value === "number" ? value : this.parseNumberString(value);

        if (!Number.isFinite(normalized) || normalized < 0) {
            throw new Error("Valor estimado inválido.");
        }

        return normalized;
    }

    private parseNumberString(value: string) {
        const trimmed = value.trim();
        if (!trimmed) return Number.NaN;
        if (trimmed.includes(",")) return Number(trimmed.replace(/\./g, "").replace(",", "."));
        return Number(trimmed);
    }

    private normalizeDate(value: string | null | undefined, label: string) {
        if (value === null || value === undefined || value.trim() === "") return null;
        const trimmed = value.trim();
        const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
            ? new Date(`${trimmed}T00:00:00.000Z`)
            : new Date(trimmed);

        if (Number.isNaN(date.getTime())) {
            throw new Error(`Data de ${label} inválida.`);
        }

        return date;
    }

    private hasField(object: object, key: PropertyKey) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }
}

export namespace UpdateOportunidadeDetails {
    export type Params = UpdateOportunidadeDetailsDTO;
    export type Response = UpdateOportunidadeDetailsView;
}
