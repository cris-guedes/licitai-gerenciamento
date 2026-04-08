import type { RouteConfig } from "../adapters/http-adapter";
import { makeExtractEditalData } from "../../domain/use-cases/licitacao/extract-edital-data/makeExtractEditalData";

export const licitacaoRoutes: Record<string, RouteConfig> = {
    "extract-edital-data": { make: makeExtractEditalData, method: "POST" },
};
