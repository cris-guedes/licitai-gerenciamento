import { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { OpenAiProvider } from "@/server/shared/infra/providers/ai/OpenAiProvider";
import { PdfParseProvider } from "@/server/shared/infra/providers/pdf/PdfParseProvider";
import { RunEditalAnalysis } from "./RunEditalAnalysis";
import { RunEditalAnalysisController } from "./RunEditalAnalysisController";

export function makeRunEditalAnalysis(): RunEditalAnalysisController {
    const useCase = new RunEditalAnalysis(
        new PrismaEditalAnalysisRepository(),
        new PrismaDocumentRepository(),
        new PrismaMembershipRepository(),
        new OpenAiProvider(),
        new PdfParseProvider(),
    );
    return new RunEditalAnalysisController(useCase);
}
