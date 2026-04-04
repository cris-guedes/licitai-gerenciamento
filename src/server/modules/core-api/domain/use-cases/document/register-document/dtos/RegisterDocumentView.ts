import type { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";

export type RegisterDocumentView = {
    id: string;
    orgId: string;
    companyId: string;
    editalId: string;
    type: string;
    url: string;
    publishedAt: string | null;
    createdAt: string;
};

export const RegisterDocumentMapper = {
    toView(doc: PrismaDocumentRepository.DocumentResponse): RegisterDocumentView {
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
