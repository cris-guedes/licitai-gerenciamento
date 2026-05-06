import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { LicitacaoWorkspaceViewMapper } from "../_shared/licitacaoWorkspaceView";
import type { ListLicitacaoDraftsDTO } from "./dtos/ListLicitacaoDraftsDTOs";
import type { ListLicitacaoDraftsView } from "./dtos/ListLicitacaoDraftsView";

export class ListLicitacaoDrafts {
    constructor(
        private readonly licitacaoRepository: PrismaLicitacaoRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListLicitacaoDrafts.Params): Promise<ListLicitacaoDrafts.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const drafts = await this.licitacaoRepository.listDraftsByCompanyId({
            companyId: params.companyId,
        });

        return {
            drafts: drafts.map(draft => LicitacaoWorkspaceViewMapper.toDraftSummary(draft)),
        };
    }
}

export namespace ListLicitacaoDrafts {
    export type Params = ListLicitacaoDraftsDTO;
    export type Response = ListLicitacaoDraftsView;
}
