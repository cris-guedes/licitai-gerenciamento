/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { OportunidadeBoardViewMapper } from "../_shared/oportunidadeBoardView";
import type { ListOportunidadesBoardDTO } from "./dtos/ListOportunidadesBoardDTOs";
import type { ListOportunidadesBoardView } from "./dtos/ListOportunidadesBoardView";

function getEstimatedValue(item: PrismaOportunidadeRepository.OportunidadeBoardRecord): number | null {
    const raw = item.edital?.valorEstimado?.toString?.()
        ?? item.licitacao?.valorEstimadoTotal?.toString?.()
        ?? null;

    if (!raw) return null;

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
}

function formatDecimal(value: number): string {
    return value.toFixed(2);
}

export class ListOportunidadesBoard {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListOportunidadesBoard.Params): Promise<ListOportunidadesBoard.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const items = await this.oportunidadeRepository.listBoardByCompanyId({
            companyId: params.companyId,
            workflowNodeIds: params.workflowNodeIds,
            currentPhaseNodeId: params.currentPhaseNodeId,
            currentStatusNodeId: params.currentStatusNodeId,
            currentSituationNodeId: params.currentSituationNodeId,
            responsavelUserId: params.responsavelUserId,
            valorEstimadoMin: params.valorEstimadoMin,
            valorEstimadoMax: params.valorEstimadoMax,
            q: params.q,
        });
        const filterSourceItems = await this.oportunidadeRepository.listBoardByCompanyId({
            companyId: params.companyId,
        });

        const columnSummaryByPhaseId = new Map<string, { phaseNodeId: string; itemCount: number; valorEstimadoTotal: number }>();
        for (const item of items) {
            const phaseNodeId = item.currentPhaseNodeId;
            if (!phaseNodeId) continue;

            const current = columnSummaryByPhaseId.get(phaseNodeId) ?? {
                phaseNodeId,
                itemCount: 0,
                valorEstimadoTotal: 0,
            };
            current.itemCount += 1;
            current.valorEstimadoTotal += getEstimatedValue(item) ?? 0;
            columnSummaryByPhaseId.set(phaseNodeId, current);
        }

        const responsavelById = new Map<string, { id: string; name: string; email: string }>();
        const situationById = new Map<string, { id: string; label: string }>();
        const values: number[] = [];

        for (const item of filterSourceItems) {
            if (item.responsavel) {
                responsavelById.set(item.responsavel.id, {
                    id: item.responsavel.id,
                    name: item.responsavel.name,
                    email: item.responsavel.email,
                });
            }

            if (item.currentSituationNode) {
                situationById.set(item.currentSituationNode.id, {
                    id: item.currentSituationNode.id,
                    label: item.currentSituationNode.label,
                });
            }

            const value = getEstimatedValue(item);
            if (value !== null) values.push(value);
        }

        return {
            items: items.map(item => OportunidadeBoardViewMapper.toItemView({
                oportunidade: item,
                currentUserId: params.userId,
            })),
            total: items.length,
            columnSummaries: Array.from(columnSummaryByPhaseId.values()).map(summary => ({
                phaseNodeId: summary.phaseNodeId,
                itemCount: summary.itemCount,
                valorEstimadoTotal: formatDecimal(summary.valorEstimadoTotal),
            })),
            filterOptions: {
                responsaveis: Array.from(responsavelById.values()).sort((a, b) => a.name.localeCompare(b.name)),
                situations: Array.from(situationById.values()).sort((a, b) => a.label.localeCompare(b.label)),
                valueRange: {
                    min: values.length > 0 ? formatDecimal(Math.min(...values)) : null,
                    max: values.length > 0 ? formatDecimal(Math.max(...values)) : null,
                },
            },
        };
    }
}

export namespace ListOportunidadesBoard {
    export type Params = ListOportunidadesBoardDTO;
    export type Response = ListOportunidadesBoardView;
}
