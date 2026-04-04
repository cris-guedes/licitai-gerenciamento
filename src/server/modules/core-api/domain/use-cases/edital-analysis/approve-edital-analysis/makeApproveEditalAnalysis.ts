import { PrismaEditalAnalysisRepository } from "@/server/shared/infra/repositories/edital-analysis.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ApproveEditalAnalysis } from "./ApproveEditalAnalysis";
import { ApproveEditalAnalysisController } from "./ApproveEditalAnalysisController";

export function makeApproveEditalAnalysis(): ApproveEditalAnalysisController {
    const useCase = new ApproveEditalAnalysis(
        new PrismaEditalAnalysisRepository(),
        new PrismaMembershipRepository(),
    );
    return new ApproveEditalAnalysisController(useCase);
}
