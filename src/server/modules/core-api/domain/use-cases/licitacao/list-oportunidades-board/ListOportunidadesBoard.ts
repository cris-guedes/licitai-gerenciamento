/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { OportunidadeBoardViewMapper } from "../_shared/oportunidadeBoardView";
import type { ListOportunidadesBoardDTO } from "./dtos/ListOportunidadesBoardDTOs";
import type { ListOportunidadesBoardView } from "./dtos/ListOportunidadesBoardView";

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
            currentPhaseNodeId: params.currentPhaseNodeId,
            currentStatusNodeId: params.currentStatusNodeId,
            currentSituationNodeId: params.currentSituationNodeId,
            responsavelUserId: params.responsavelUserId,
            q: params.q,
        });

        return {
            items: items.map(item => OportunidadeBoardViewMapper.toItemView({
                oportunidade: item,
                currentUserId: params.userId,
            })),
            total: items.length,
        };
    }
}

export namespace ListOportunidadesBoard {
    export type Params = ListOportunidadesBoardDTO;
    export type Response = ListOportunidadesBoardView;
}
