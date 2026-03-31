import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import { makeCreateCompany } from "../../domain/use-cases/company/create-company/makeCreateCompany";
import { makeDeleteCompany } from "../../domain/use-cases/company/delete-company/makeDeleteCompany";
import { makeFetchCompanyById } from "../../domain/use-cases/company/fetch-company-by-id/makeFetchCompanyById";
import { makeListCompanies } from "../../domain/use-cases/company/list-companies/makeListCompanies";
import { makeUpdateCompany } from "../../domain/use-cases/company/update-company/makeUpdateCompany";

export const companyRoutes: Record<string, RouteConfig> = {
    "company/fetch-company-by-id": { make: makeFetchCompanyById, method: "GET", preHandlers: [authMiddleware] },
    "company/list-companies": { make: makeListCompanies, method: "GET", preHandlers: [authMiddleware] },
    "company/create-company": { make: makeCreateCompany, method: "POST", preHandlers: [authMiddleware] },
    "company/update-company": { make: makeUpdateCompany, method: "POST", preHandlers: [authMiddleware] },
    "company/delete-company": { make: makeDeleteCompany, method: "POST", preHandlers: [authMiddleware] },
};
