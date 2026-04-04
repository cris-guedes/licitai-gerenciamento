import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { R2StorageProvider } from "@/server/shared/infra/providers/storage/R2StorageProvider";
import { UploadDocument } from "./UploadDocument";
import { UploadDocumentController } from "./UploadDocumentController";

export function makeUploadDocument(): UploadDocumentController {
    const useCase = new UploadDocument(
        new PrismaDocumentRepository(),
        new PrismaMembershipRepository(),
        new R2StorageProvider(),
    );
    return new UploadDocumentController(useCase);
}
