import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { OpenAiProvider } from "@/server/shared/infra/providers/ai/OpenAiProvider";
import { PdfParseProvider } from "@/server/shared/infra/providers/pdf/PdfParseProvider";
import { RunDocumentSummary } from "./RunDocumentSummary";
import { RunDocumentSummaryController } from "./RunDocumentSummaryController";

export function makeRunDocumentSummary(): RunDocumentSummaryController {
    const useCase = new RunDocumentSummary(
        new PrismaDocumentRepository(),
        new PrismaMembershipRepository(),
        new OpenAiProvider(),
        new PdfParseProvider(),
    );
    return new RunDocumentSummaryController(useCase);
}
