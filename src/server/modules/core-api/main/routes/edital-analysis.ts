import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import { makeRunEditalAnalysis } from "../../domain/use-cases/edital-analysis/run-edital-analysis/makeRunEditalAnalysis";
import { makeListEditalAnalyses } from "../../domain/use-cases/edital-analysis/list-edital-analyses/makeListEditalAnalyses";
import { makeApproveEditalAnalysis } from "../../domain/use-cases/edital-analysis/approve-edital-analysis/makeApproveEditalAnalysis";

export const editalAnalysisRoutes: Record<string, RouteConfig> = {
    "edital-analysis/run":     { make: makeRunEditalAnalysis,     method: "POST", preHandlers: [authMiddleware] },
    "edital-analysis/list":    { make: makeListEditalAnalyses,    method: "GET",  preHandlers: [authMiddleware] },
    "edital-analysis/approve": { make: makeApproveEditalAnalysis, method: "POST", preHandlers: [authMiddleware] },
};
