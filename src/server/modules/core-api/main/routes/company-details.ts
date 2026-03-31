import type { RouteConfig } from "../adapters/http-adapter";
import { makeFetchCompanyByCnpj } from "../../domain/use-cases/company-details/fetch-company-by-cnpj/makeFetchCompanyByCnpj";

export const companyDetailsRoutes: Record<string, RouteConfig> = {
    "fetch-company-by-cnpj": { make: makeFetchCompanyByCnpj },
};
