import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";

export async function assertUserCanAccessDocument(params: {
    documentRepository: PrismaDocumentRepository;
    companyRepository: PrismaCompanyRepository;
    membershipRepository: PrismaMembershipRepository;
    documentId: string;
    userId: string;
}) {
    const document = await params.documentRepository.findById({ id: params.documentId });

    if (!document) {
        throw new Error("Documento não encontrado.");
    }

    await assertUserCanAccessCompany({
        companyRepository: params.companyRepository,
        membershipRepository: params.membershipRepository,
        userId: params.userId,
        companyId: document.companyId,
    });

    const company = await params.companyRepository.findById({ id: document.companyId });
    if (!company) {
        throw new Error("Empresa vinculada ao documento não foi encontrada.");
    }

    return { document, company };
}
