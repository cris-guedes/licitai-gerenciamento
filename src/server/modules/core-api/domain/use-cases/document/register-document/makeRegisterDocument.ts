import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { RegisterDocument } from "./RegisterDocument";
import { RegisterDocumentController } from "./RegisterDocumentController";

export function makeRegisterDocument(): RegisterDocumentController {
    const useCase = new RegisterDocument(
        new PrismaDocumentRepository(),
        new PrismaMembershipRepository(),
    );
    return new RegisterDocumentController(useCase);
}
