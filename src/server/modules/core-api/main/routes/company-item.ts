import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import { makeCreateCompanyItem } from "../../domain/use-cases/company-item/create-company-item/makeCreateCompanyItem";
import { makeDeleteCompanyItem } from "../../domain/use-cases/company-item/delete-company-item/makeDeleteCompanyItem";
import { makeFetchCompanyItemById } from "../../domain/use-cases/company-item/fetch-company-item-by-id/makeFetchCompanyItemById";
import { makeListCompanyItems } from "../../domain/use-cases/company-item/list-company-items/makeListCompanyItems";
import { makeUpdateCompanyItem } from "../../domain/use-cases/company-item/update-company-item/makeUpdateCompanyItem";

export const companyItemRoutes: Record<string, RouteConfig> = {
    "company-item/fetch-company-item-by-id": { make: makeFetchCompanyItemById, method: "GET", preHandlers: [authMiddleware] },
    "company-item/list-company-items": { make: makeListCompanyItems, method: "GET", preHandlers: [authMiddleware] },
    "company-item/create-company-item": { make: makeCreateCompanyItem, method: "POST", preHandlers: [authMiddleware] },
    "company-item/update-company-item": { make: makeUpdateCompanyItem, method: "POST", preHandlers: [authMiddleware] },
    "company-item/delete-company-item": { make: makeDeleteCompanyItem, method: "POST", preHandlers: [authMiddleware] },
};
