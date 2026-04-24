import type { RouteConfig } from "../adapters/http-adapter";
import {
    makeExtractEditalData,
    makeExtractEditalDataStream,
} from "../../domain/use-cases/licitacao/extract-edital-data/makeExtractEditalDataStream";

export const licitacaoRoutes: Record<string, RouteConfig> = {
    "extract-edital-data": { make: makeExtractEditalData, method: "POST" },
    "extract-edital-data/stream": { makeStream: makeExtractEditalDataStream, method: "POST" },
};
