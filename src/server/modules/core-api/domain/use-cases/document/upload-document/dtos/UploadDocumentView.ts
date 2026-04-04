import type { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";

export type UploadDocumentView = {
    id: string;
    orgId: string;
    companyId: string;
    editalId: string;
    type: string;
    url: string;
    publishedAt: string | null;
    createdAt: string;
};

export const UploadDocumentMapper = {
    toView(doc: PrismaDocumentRepository.DocumentResponse): UploadDocumentView {
        return {
            id:          doc.id,
            orgId:       doc.orgId,
            companyId:   doc.companyId,
            editalId:    doc.editalId,
            type:        doc.type,
            url:         doc.url,
            publishedAt: doc.publishedAt?.toISOString() ?? null,
            createdAt:   doc.createdAt.toISOString(),
        };
    },
};
