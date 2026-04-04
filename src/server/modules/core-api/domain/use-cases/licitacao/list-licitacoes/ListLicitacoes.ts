import { PrismaEditalRepository } from "@/server/shared/infra/repositories/edital.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { ListLicitacoesMapper, type ListLicitacoesView } from "./dtos/ListLicitacoesView";
import type { ListLicitacoesDTO } from "./dtos/ListLicitacoesDTOs";

export class ListLicitacoes {
    constructor(
        private readonly editalRepository: PrismaEditalRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListLicitacoes.Params): Promise<ListLicitacoes.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const items = await this.editalRepository.listWithTender({
            orgId: params.orgId,
            companyId: params.companyId,
        });

        return ListLicitacoesMapper.toView(items);
    }
}

export namespace ListLicitacoes {
    export type Params = ListLicitacoesDTO & { userId: string };
    export type Response = ListLicitacoesView;
}
