import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { RegisterDocumentMapper, type RegisterDocumentView } from "./dtos/RegisterDocumentView";
import type { RegisterDocumentDTO } from "./dtos/RegisterDocumentDTOs";

export class RegisterDocument {
    constructor(
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: RegisterDocument.Params): Promise<RegisterDocument.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const doc = await this.documentRepository.create({
            orgId:       params.orgId,
            companyId:   params.companyId,
            editalId:    params.editalId,
            type:        params.type,
            url:         params.url,
            publishedAt: params.publishedAt ? new Date(params.publishedAt) : null,
        });

        return RegisterDocumentMapper.toView(doc);
    }
}

export namespace RegisterDocument {
    export type Params = RegisterDocumentDTO & { userId: string };
    export type Response = RegisterDocumentView;
}
