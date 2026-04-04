import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { UploadDocumentMapper, type UploadDocumentView } from "./dtos/UploadDocumentView";
import type { UploadDocumentDTO } from "./dtos/UploadDocumentDTOs";
import type { StorageProvider } from "@/server/shared/infra/providers/storage/StorageProvider";
import { randomUUID } from "crypto";

export class UploadDocument {
    constructor(
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly storageProvider: StorageProvider,
    ) {}

    async execute(params: UploadDocument.Params): Promise<UploadDocument.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const ext  = params.file.name.split(".").pop() ?? "pdf";
        const key  = `documents/${params.orgId}/${params.editalId}/${randomUUID()}.${ext}`;
        const url  = await this.storageProvider.upload({
            key,
            buffer:      params.file.buffer,
            contentType: params.file.type || "application/pdf",
        });

        const doc = await this.documentRepository.create({
            orgId:       params.orgId,
            companyId:   params.companyId,
            editalId:    params.editalId,
            type:        params.type,
            url,
            publishedAt: params.publishedAt ? new Date(params.publishedAt) : null,
        });

        return UploadDocumentMapper.toView(doc);
    }
}

export namespace UploadDocument {
    export type Params = UploadDocumentDTO & { userId: string };
    export type Response = UploadDocumentView;
}
