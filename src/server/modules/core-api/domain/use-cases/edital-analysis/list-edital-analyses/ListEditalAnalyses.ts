import { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { EditalAnalysisMapper, type EditalAnalysisView } from "../run-edital-analysis/dtos/RunEditalAnalysisView";

export class ListEditalAnalyses {
    constructor(
        private readonly editalAnalysisRepository: PrismaEditalAnalysisRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListEditalAnalyses.Params): Promise<ListEditalAnalyses.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const analyses = await this.editalAnalysisRepository.listByEdital(params.editalId);
        return { analyses: analyses.map(EditalAnalysisMapper.toView) };
    }
}

export namespace ListEditalAnalyses {
    export type Params = { orgId: string; editalId: string; userId: string };
    export type Response = { analyses: EditalAnalysisView[] };
}
