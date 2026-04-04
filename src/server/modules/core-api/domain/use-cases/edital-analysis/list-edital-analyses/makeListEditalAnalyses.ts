import { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListEditalAnalyses } from "./ListEditalAnalyses";
import { ListEditalAnalysesController } from "./ListEditalAnalysesController";

export function makeListEditalAnalyses(): ListEditalAnalysesController {
    const useCase = new ListEditalAnalyses(
        new PrismaEditalAnalysisRepository(),
        new PrismaMembershipRepository(),
    );
    return new ListEditalAnalysesController(useCase);
}
