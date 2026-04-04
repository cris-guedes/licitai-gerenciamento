import type { RouteConfig } from "../adapters/http-adapter";

import { publicProcurementsRoutes } from "../routes/public-procurements";
import { companyDetailsRoutes }     from "../routes/company-details";
import { companyRoutes }            from "../routes/company";
import { onboardingRoutes }         from "../routes/onboarding";
import { authRoutes }               from "../routes/auth";
import { teamRoutes }               from "../routes/team";
import { licitacaoRoutes }          from "../routes/licitacao";
import { documentRoutes }           from "../routes/document";
import { editalAnalysisRoutes }     from "../routes/edital-analysis";

export const allRoutes: Record<string, RouteConfig> = {

    ...publicProcurementsRoutes,
    ...companyDetailsRoutes,
    ...companyRoutes,
    ...onboardingRoutes,
    ...authRoutes,
    ...teamRoutes,
    ...licitacaoRoutes,
    ...documentRoutes,
    ...editalAnalysisRoutes,

};

export type RouteKey = keyof typeof allRoutes;
